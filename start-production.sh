#!/bin/bash
echo "Starting Velink in Production Mode..."
echo
echo "Building frontend..."
npm run build
echo
echo "Starting production server..."
npm run start:prod
