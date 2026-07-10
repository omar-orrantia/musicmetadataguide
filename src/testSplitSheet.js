#!/usr/bin/env node

/**
 * Song Split Sheet Demo & Test
 * Test file for SongSplitSheet functionality
 */

const { SongSplitSheet } = require('./songSplitSheet.js');

console.log('\n🎵 Song Split Sheet Demo 🎵\n');

// Create a split sheet for a collaborative song
const split = new SongSplitSheet('Summer Vibes', 'Various Artists');

// Add 5 writers with different roles and percentages
split.addWriter('Writer 1', 'Composer', 50, '00123456789', 'ASCAP');
split.addWriter('Writer 2', 'Lyricist', 25, '00987654321', 'BMI');
split.addWriter('Writer 3', 'Producer', 15, '00555555555', 'SESAC');
split.addWriter('Writer 4', 'Arranger', 7, '00444444444', 'ASCAP');
split.addWriter('Writer 5', 'Co-Composer', 3, '00333333333', 'BMI');

// Display the split sheet
split.displaySplitSheet();

// Validate the split sheet
split.validate();

// Calculate royalties for $10,000
split.calculateRoyalties(10000);

// Save to file
split.saveSplitSheet('demo_split_sheet');

console.log('✅ Demo completed! Check config/ folder for saved files.\n');
