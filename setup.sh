#!/bin/bash

# Setup script to make scripts executable

echo "Setting up deployment scripts..."

# Make build script executable
chmod +x build.sh

# Make start script executable  
chmod +x start.sh

echo "Scripts are now executable!"
echo "Ready for deployment to Render!"
