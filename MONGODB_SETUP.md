# MongoDB Local Setup Guide

## Quick Setup Instructions

### Option 1: Using Chocolatey (Recommended - Fastest)

If you have Chocolatey package manager installed:

```bash
choco install mongodb
```

### Option 2: Manual Installation

1. **Download MongoDB Community Server**
   - Visit: https://www.mongodb.com/try/download/community
   - Select: Windows, Latest Version, MSI package
   - Click Download

2. **Install MongoDB**
   - Run the downloaded `.msi` file
   - Choose "Complete" installation
   - Install MongoDB as a Service (check the box)
   - Default data directory: `C:\Program Files\MongoDB\Server\[version]\data`

3. **Verify Installation**
   ```bash
   mongod --version
   ```

### Option 3: Use MongoDB Atlas (Cloud - No Installation)

If you prefer cloud-based MongoDB:

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free
3. Create a free cluster
4. Get connection string
5. Update `.env` file:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/todo-app
   ```

## Starting MongoDB Service

### If installed as Windows Service:
```bash
net start MongoDB
```

### If not installed as service:
```bash
# Create data directory
mkdir C:\data\db

# Start MongoDB manually
mongod
```

## Current Configuration

Your `.env` file is already set to use local MongoDB:
```
MONGODB_URI=mongodb://localhost:27017/todo-app
PORT=5000
```

This will work once MongoDB is running locally!
