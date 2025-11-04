import { newEnforcer } from 'casbin';
import { MongoAdapter } from 'casbin-mongodb-adapter';
import { logger } from './logger';
import { config } from './environment';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let enforcerInstance: any = null;

export async function getCasbinEnforcer(): Promise<any> {
  if (enforcerInstance) {
    return enforcerInstance;
  }

  try {
    // Load CASBIN model from package - correct path calculation
    // From apps/api/src/config/casbin.ts -> ../../../../packages/casbin-config/src/model.conf
    let modelPath = join(__dirname, '../../../../packages/casbin-config/src/model.conf');
    
    // Check if file exists, if not try from process.cwd()
    try {
      readFileSync(modelPath, 'utf-8');
    } catch {
      modelPath = join(process.cwd(), 'packages/casbin-config/src/model.conf');
    }

    // Extract database name from MongoDB URI
    const uriObj = new URL(config.mongoUri);
    const databaseName = uriObj.pathname?.split('/')[1] || 'casbin';

    // Create MongoDB adapter
    const adapter = await MongoAdapter.newAdapter({
      uri: config.mongoUri,
      database: databaseName,
      collection: 'casbin_rule',
    });

    // Create enforcer with file path (not content)
    enforcerInstance = await newEnforcer(modelPath, adapter);
    
    logger.info('✅ CASBIN enforcer initialized successfully');
    return enforcerInstance;
  } catch (error) {
    logger.error('❌ CASBIN initialization error:', error);
    // Create a basic model if file not found - use inline model string
    const basicModel = `
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act
`;
    // Extract database name from MongoDB URI
    const uriObj = new URL(config.mongoUri);
    const databaseName = uriObj.pathname?.split('/')[1] || 'casbin';
    
    const adapter = await MongoAdapter.newAdapter({
      uri: config.mongoUri,
      database: databaseName,
      collection: 'casbin_rule',
    });
    
    // Use newModelFromString for inline model
    const { newModelFromString } = await import('casbin');
    const model = newModelFromString(basicModel);
    enforcerInstance = await newEnforcer(model, adapter);
    logger.info('✅ CASBIN enforcer initialized with basic model');
    return enforcerInstance;
  }
}
