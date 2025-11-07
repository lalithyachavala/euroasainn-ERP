# MongoDB Atlas Authentication Troubleshooting Guide

## Error: "bad auth : Authentication failed" (Code: 8000)

This error indicates that MongoDB Atlas is rejecting your connection credentials. Here's how to fix it:

## Common Causes & Solutions

### 1. **Password Contains Special Characters**

**Problem**: If your MongoDB password contains special characters like `@`, `#`, `%`, `:`, `/`, etc., they must be URL-encoded in the connection string.

**Solution**: URL-encode special characters in your password:

| Character | URL-Encoded |
|-----------|-------------|
| `@` | `%40` |
| `#` | `%23` |
| `%` | `%25` |
| `:` | `%3A` |
| `/` | `%2F` |
| `?` | `%3F` |
| `=` | `%3D` |
| `&` | `%26` |
| ` ` (space) | `%20` |

**Example**:
```
# Original password: P@ssw0rd#123
# URL-encoded: P%40ssw0rd%23123

# Connection string:
mongodb+srv://username:P%40ssw0rd%23123@cluster.mongodb.net/database
```

**Quick Fix**: Use an online URL encoder or Node.js:
```javascript
encodeURIComponent('your-password')
```

### 2. **IP Address Not Whitelisted**

**Problem**: MongoDB Atlas blocks connections from IP addresses that aren't whitelisted.

**Solution**:
1. Go to MongoDB Atlas Dashboard
2. Navigate to **Network Access** (or **Security** → **Network Access**)
3. Click **Add IP Address**
4. Add your current IP address:
   - **Current IP**: Click "Add Current IP Address" button
   - **All IPs** (for development): `0.0.0.0/0` ⚠️ **Not recommended for production**
5. Save changes (takes 1-2 minutes to apply)

### 3. **Incorrect Username or Password**

**Problem**: Wrong credentials in the connection string.

**Solution**:
1. Go to MongoDB Atlas Dashboard
2. Navigate to **Database Access** (or **Security** → **Database Access**)
3. Check your database user:
   - Verify username is correct
   - Reset password if needed
   - Ensure user has proper permissions (at least `readWrite` on your database)

### 4. **Database User Doesn't Exist**

**Problem**: The database user specified in the connection string doesn't exist.

**Solution**:
1. Go to MongoDB Atlas Dashboard
2. Navigate to **Database Access**
3. Click **Add New Database User**
4. Choose:
   - **Authentication Method**: Password
   - **Username**: Your desired username
   - **Password**: Generate or create a secure password
   - **Database User Privileges**: 
     - For development: `Atlas admin` or `Read and write to any database`
     - For production: Custom role with specific permissions
5. Save the user

### 5. **Connection String Format Incorrect**

**Problem**: The connection string format is wrong.

**Correct Format**:
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

**Example**:
```
mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/euroasiann?retryWrites=true&w=majority
```

**Where to get it**:
1. Go to MongoDB Atlas Dashboard
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Copy the connection string
5. Replace `<password>` with your actual password (URL-encoded if needed)
6. Replace `<database>` with your database name (e.g., `euroasiann`)

### 6. **Database Name Missing or Incorrect**

**Problem**: The database name in the connection string is missing or wrong.

**Solution**: Ensure your connection string includes the database name:
```
mongodb+srv://username:password@cluster.mongodb.net/euroasiann
                                                           ^
                                                    Database name here
```

## Step-by-Step Fix Checklist

1. ✅ **Get your connection string from MongoDB Atlas**
   - Dashboard → Connect → Connect your application
   - Copy the connection string

2. ✅ **URL-encode your password**
   - Use `encodeURIComponent()` or an online encoder
   - Replace `<password>` in connection string

3. ✅ **Verify database user exists**
   - Dashboard → Database Access
   - Check username and permissions

4. ✅ **Whitelist your IP address**
   - Dashboard → Network Access
   - Add current IP address

5. ✅ **Test the connection string**
   - Update `.env` file with the connection string
   - Restart your API server
   - Check logs for connection success

6. ✅ **Verify database name**
   - Ensure database name in connection string matches your database

## Testing Your Connection String

### Using MongoDB Compass
1. Download MongoDB Compass
2. Paste your connection string
3. Click Connect
4. If it connects, your credentials are correct

### Using Node.js Script
```javascript
const mongoose = require('mongoose');

const uri = 'mongodb+srv://username:password@cluster.mongodb.net/database';

mongoose.connect(uri)
  .then(() => console.log('✅ Connected successfully'))
  .catch(err => console.error('❌ Connection failed:', err.message));
```

### Using MongoDB Shell
```bash
mongosh "mongodb+srv://username:password@cluster.mongodb.net/database"
```

## Environment Variable Setup

In your `.env` file:
```env
MONGODB_URI=mongodb+srv://username:URL_ENCODED_PASSWORD@cluster.mongodb.net/euroasiann?retryWrites=true&w=majority
```

**Important**: 
- Don't use quotes around the connection string
- URL-encode special characters in password
- Replace placeholders with actual values

## Security Best Practices

1. **Don't use `0.0.0.0/0` in production** - Only whitelist specific IPs
2. **Use strong passwords** - At least 16 characters, mix of letters, numbers, symbols
3. **Create separate database users** - One for development, one for production
4. **Limit user permissions** - Grant only necessary permissions
5. **Rotate passwords regularly** - Change passwords periodically
6. **Don't commit `.env` to Git** - Keep credentials secure

## Still Having Issues?

1. **Check MongoDB Atlas Status**: https://status.mongodb.com/
2. **Check MongoDB Atlas Logs**: Dashboard → Logs
3. **Verify Network Connectivity**: Ensure you can reach MongoDB Atlas
4. **Check Firewall**: Ensure firewall isn't blocking MongoDB ports
5. **Try Different Network**: Test from a different network/IP

## Example Connection String (Template)

```env
# Format:
MONGODB_URI=mongodb+srv://<username>:<encoded-password>@<cluster-host>/<database>?retryWrites=true&w=majority

# Example (DO NOT USE - This is just a template):
MONGODB_URI=mongodb+srv://admin:P%40ssw0rd123@cluster0.abc123.mongodb.net/euroasiann?retryWrites=true&w=majority
```

## Common Password Encoding Examples

```javascript
// Password: MyP@ss#123
// Encoded: MyP%40ss%23123

// Password: Test@123!@#
// Encoded: Test%40123%21%40%23

// Password: P@$$w0rd
// Encoded: P%40%24%24w0rd
```

Use this online tool: https://www.urlencoder.org/

