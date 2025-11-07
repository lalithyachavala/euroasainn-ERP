# Email Setup Verification Guide

## ✅ Email Sending Flow

When you create an organization with email `lalithyachavala@gmail.com`:

1. **Form Submission** → Frontend sends `adminEmail: "lalithyachavala@gmail.com"` to backend
2. **Backend Processing** → Creates organization, creates admin user, sends email
3. **Email Delivery** → Email sent to `lalithyachavala@gmail.com` with:
   - Welcome message
   - Organization name
   - Temporary password
   - Invitation link

## 🔍 How to Verify Email is Being Sent

### 1. Check Browser Console (F12)

When you submit the form, you should see:
```
📤 Admin Portal: Sending organization creation request
   ⭐ Admin Email (will receive invitation): lalithyachavala@gmail.com
```

After submission:
```
📥 Admin Portal: Organization creation response:
   emailSent: true
   emailTo: "lalithyachavala@gmail.com"
   message: "Organization created successfully. Invitation email has been sent to lalithyachavala@gmail.com."
```

### 2. Check Backend Logs

Look for these log messages in your backend terminal:

```
📝 Creating organization request received
   Admin Email from form: lalithyachavala@gmail.com

📤 Controller: Preparing to send invitation email
   ⭐ RECIPIENT EMAIL: lalithyachavala@gmail.com

📮 Invitation service: Sending invitation email
   Recipient email: lalithyachavala@gmail.com

📧 Email service: Preparing to send invitation email
   TO: lalithyachavala@gmail.com (this is the email from the form)

✅ Email service: Invitation email successfully sent to lalithyachavala@gmail.com
   Message ID: <message-id>
```

### 3. Check Email Inbox

- **Recipient**: `lalithyachavala@gmail.com`
- **Subject**: "Welcome to Euroasiann ERP - [Organization Name] Onboarding"
- **Content**: 
  - Welcome message
  - Temporary password
  - Invitation link
  - Instructions

**Note**: Check spam folder if email is not in inbox!

## 🚨 Troubleshooting Connection Errors

### Error: `ERR_CONNECTION_RESET` or `ERR_CONNECTION_REFUSED`

**Problem**: Backend server is not running or not accessible.

**Solution**:
1. **Start the backend server**:
   ```bash
   cd apps/api
   npm run dev
   ```

2. **Verify backend is running**:
   - Check terminal for: `🚀 Server running on port 3000`
   - Open browser: http://localhost:3000/health
   - Should return: `{"status":"ok"}`

3. **Check backend logs**:
   - Look for MongoDB connection: `✅ MongoDB connected successfully`
   - Look for email transporter: `Email transporter is ready to send emails`

### Error: Email Not Received

**Possible Causes**:

1. **SMTP Configuration Issue**
   - Check `.env` file in `apps/api/` directory
   - Verify these variables are set:
     ```env
     EMAIL_HOST=smtppro.zoho.in
     EMAIL_PORT=465
     EMAIL_USER=technical@euroasianngroup.com
     EMAIL_PASS=your-password-here
     ```

2. **Email in Spam Folder**
   - Check spam/junk folder in `lalithyachavala@gmail.com`
   - Mark as "Not Spam" if found

3. **SMTP Authentication Failed**
   - Check backend logs for: `❌ FAILED: Could not send invitation email`
   - Verify EMAIL_USER and EMAIL_PASS are correct
   - Ensure password doesn't need URL encoding

4. **Backend Logs Show Email Sent But Not Received**
   - Check if email service is blocking the email
   - Verify the recipient email address is correct
   - Check email service logs/dashboard

## 📋 Step-by-Step Verification

### Step 1: Verify Backend is Running
```bash
# Terminal 1: Start backend
cd apps/api
npm run dev

# Terminal 2: Test health endpoint
curl http://localhost:3000/health
# Should return: {"status":"ok"}
```

### Step 2: Verify Email Configuration
Check backend logs on startup for:
```
✅ MongoDB connected successfully
Email transporter is ready to send emails
```

If you see errors, check `.env` file configuration.

### Step 3: Create Organization
1. Open Admin Portal: http://localhost:4200/organizations
2. Click "+ Add Organization"
3. Fill in the form:
   - **Organization Name**: Test Organization
   - **Admin Email**: `lalithyachavala@gmail.com`
   - **First Name**: (optional)
   - **Last Name**: (optional)
4. Click "Create"

### Step 4: Check Logs
- **Browser Console (F12)**: Should show email being sent
- **Backend Terminal**: Should show email delivery confirmation

### Step 5: Check Email
- Open inbox for `lalithyachavala@gmail.com`
- Look for subject: "Welcome to Euroasiann ERP - Test Organization Onboarding"
- Check spam folder if not in inbox

## 🎯 Expected Behavior

When everything is working correctly:

1. ✅ Organization is created in database
2. ✅ Admin user is created with temporary password
3. ✅ Invitation email is sent to `lalithyachavala@gmail.com`
4. ✅ Frontend shows: "Organization created! Invitation email sent to lalithyachavala@gmail.com"
5. ✅ Backend logs show: "✅ SUCCESS: Invitation email sent to lalithyachavala@gmail.com"
6. ✅ Email arrives in inbox with credentials and invitation link

## 🔧 Quick Fixes

### Backend Not Running
```bash
cd apps/api
npm run dev
```

### SMTP Not Configured
Add to `apps/api/.env`:
```env
EMAIL_HOST=smtppro.zoho.in
EMAIL_PORT=465
EMAIL_USER=your-email@euroasianngroup.com
EMAIL_PASS=your-password
```

### Test Email Configuration
Backend will verify SMTP connection on startup. Look for:
- ✅ `Email transporter is ready to send emails` (success)
- ❌ `Email transporter verification failed` (check configuration)

## 📞 Need Help?

If emails are still not being sent:
1. Check backend logs for detailed error messages
2. Verify SMTP credentials in `.env` file
3. Test SMTP connection manually
4. Check email service dashboard for delivery status

