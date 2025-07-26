#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

function fixMetadataFiles(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            fixMetadataFiles(fullPath);
        } else if (item === 'metadata.yaml') {
            let content = fs.readFileSync(fullPath, 'utf8');
            console.log(`Checking file: ${fullPath}`);
            console.log(`Content contains backslash: ${content.includes('src\\cli')}`);
            
            // Replace backslashes with forward slashes in paths
            const updated = content.replace(/src\\cli\\__tests__\\fixtures/g, 'src/cli/__tests__/fixtures');
            
            if (content !== updated) {
                fs.writeFileSync(fullPath, updated);
                console.log(`Fixed: ${fullPath}`);
            }
        }
    }
}

const baselinesDir = 'src/cli/__tests__/e2e/baselines';
fixMetadataFiles(baselinesDir);
console.log('All metadata files fixed!');
