#!/usr/bin/env node

/**
 * Music Metadata Guide - Interactive CLI with Menu
 * Purpose: Interactive command-line interface for artist profile management
 * Version: 0.3.0
 */

const inquirer = require('inquirer');
const colors = require('colors');
const fs = require('fs');
const path = require('path');
const { ArtistProfile, MusicMetadataApp } = require('./index.js');

// Initialize app
const app = new MusicMetadataApp();
let currentArtist = null;

// Main menu
async function mainMenu() {
  console.clear();
  console.log(colors.cyan('\n🎵 Music Metadata Guide 🎵'));
  console.log(colors.cyan('Sync Your Metadata. Secure Your Royalties.\n'));

  const { choice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: 'What would you like to do?',
      choices: [
        { name: '📝 Create New Artist Profile', value: 'create' },
        { name: '📂 View Existing Artists', value: 'view' },
        { name: '✏️  Edit Artist Profile', value: 'edit' },
        { name: '💾 Export Profile as JSON', value: 'export' },
        { name: '🎼 Create Song Split Sheet', value: 'split' },
        { name: '📊 View Saved Files', value: 'files' },
        { name: '❌ Exit', value: 'exit' }
      ]
    }
  ]);

  switch (choice) {
    case 'create':
      await createArtistFlow();
      break;
    case 'view':
      await viewArtistsFlow();
      break;
    case 'edit':
      await editArtistFlow();
      break;
    case 'export':
      await exportProfileFlow();
      break;
    case 'split':
      await createSplitSheetFlow();
      break;
    case 'files':
      await viewSavedFilesFlow();
      break;
    case 'exit':
      console.log(colors.green('\n👋 Goodbye! Keep your metadata organized!\n'));
      process.exit(0);
  }

  // Return to main menu
  await mainMenu();
}

// Create Artist Flow
async function createArtistFlow() {
  console.clear();
  console.log(colors.yellow('\n📝 Create New Artist Profile\n'));

  const { artistName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'artistName',
      message: 'Enter artist name:',
      validate: (val) => val.length > 0 || 'Artist name cannot be empty'
    }
  ]);

  const artist = app.createArtist(artistName);
  currentArtist = artist;

  const { addCodes } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'addCodes',
      message: 'Would you like to add ISRC, IPI, and ISWC codes?',
      default: true
    }
  ]);

  if (addCodes) {
    await addCodesFlow(artist);
  }

  const { addPlatforms } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'addPlatforms',
      message: 'Would you like to add streaming platform profiles?',
      default: true
    }
  ]);

  if (addPlatforms) {
    await addPlatformsFlow(artist);
  }

  const { saveName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'saveName',
      message: 'Enter filename to save profile (without .json):',
      default: artistName.toLowerCase().replace(/\s+/g, '_')
    }
  ]);

  artist.saveProfile(saveName);
  artist.displaySummary();
  artist.displayChecklist();

  await inquirer.prompt([
    {
      type: 'input',
      name: 'continue',
      message: 'Press Enter to continue...'
    }
  ]);
}

// Add Codes Flow
async function addCodesFlow(artist) {
  const { isrc } = await inquirer.prompt([
    {
      type: 'input',
      name: 'isrc',
      message: 'Enter ISRC code (optional, press Enter to skip):'
    }
  ]);

  if (isrc) artist.registerISRC(isrc);

  const { ipi } = await inquirer.prompt([
    {
      type: 'input',
      name: 'ipi',
      message: 'Enter IPI number (optional, press Enter to skip):'
    }
  ]);

  if (ipi) artist.registerIPI(ipi);

  const { iswc } = await inquirer.prompt([
    {
      type: 'input',
      name: 'iswc',
      message: 'Enter ISWC code (optional, press Enter to skip):'
    }
  ]);

  if (iswc) artist.registerISWC(iswc);
}

// Add Platforms Flow
async function addPlatformsFlow(artist) {
  const platforms = [
    'Spotify',
    'Apple Music',
    'YouTube',
    'SoundCloud',
    'Bandcamp',
    'TIDAL',
    'Amazon Music',
    'TuneCore',
    'None - Done adding'
  ];

  let addMore = true;
  while (addMore) {
    const { platform } = await inquirer.prompt([
      {
        type: 'list',
        name: 'platform',
        message: 'Select a streaming platform:',
        choices: platforms
      }
    ]);

    if (platform === 'None - Done adding') {
      addMore = false;
    } else {
      const { profileId } = await inquirer.prompt([
        {
          type: 'input',
          name: 'profileId',
          message: `Enter your ${platform} profile ID/URL:`,
          validate: (val) => val.length > 0 || 'Profile ID cannot be empty'
        }
      ]);

      artist.addStreamingProfile(platform, profileId);
    }
  }
}

// View Artists Flow
async function viewArtistsFlow() {
  console.clear();
  console.log(colors.yellow('\n📂 Registered Artists\n'));

  app.listArtists();

  await inquirer.prompt([
    {
      type: 'input',
      name: 'continue',
      message: 'Press Enter to continue...'
    }
  ]);
}

// Edit Artist Flow
async function editArtistFlow() {
  console.clear();
  console.log(colors.yellow('\n✏️  Edit Artist Profile\n'));

  if (app.artists.length === 0) {
    console.log(colors.red('No artists to edit. Create one first!'));
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: 'Press Enter to continue...'
      }
    ]);
    return;
  }

  const artistChoices = app.artists.map((artist, index) => ({
    name: artist.artistName,
    value: index
  }));

  const { artistIndex } = await inquirer.prompt([
    {
      type: 'list',
      name: 'artistIndex',
      message: 'Select an artist to edit:',
      choices: artistChoices
    }
  ]);

  const artist = app.artists[artistIndex];
  currentArtist = artist;

  const { editChoice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'editChoice',
      message: 'What would you like to edit?',
      choices: [
        { name: 'Add/Update ISRC Code', value: 'isrc' },
        { name: 'Add/Update IPI Number', value: 'ipi' },
        { name: 'Add/Update ISWC Code', value: 'iswc' },
        { name: 'Add Streaming Platform', value: 'platform' },
        { name: 'View Profile', value: 'view' },
        { name: 'Cancel', value: 'cancel' }
      ]
    }
  ]);

  switch (editChoice) {
    case 'isrc':
      const { isrc } = await inquirer.prompt([
        {
          type: 'input',
          name: 'isrc',
          message: 'Enter ISRC code:',
          validate: (val) => val.length > 0 || 'ISRC cannot be empty'
        }
      ]);
      artist.registerISRC(isrc);
      break;
    case 'ipi':
      const { ipi } = await inquirer.prompt([
        {
          type: 'input',
          name: 'ipi',
          message: 'Enter IPI number:',
          validate: (val) => val.length > 0 || 'IPI cannot be empty'
        }
      ]);
      artist.registerIPI(ipi);
      break;
    case 'iswc':
      const { iswc } = await inquirer.prompt([
        {
          type: 'input',
          name: 'iswc',
          message: 'Enter ISWC code:',
          validate: (val) => val.length > 0 || 'ISWC cannot be empty'
        }
      ]);
      artist.registerISWC(iswc);
      break;
    case 'platform':
      await addPlatformsFlow(artist);
      break;
    case 'view':
      artist.displaySummary();
      artist.displayChecklist();
      break;
  }

  const { save } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'save',
      message: 'Save changes?',
      default: true
    }
  ]);

  if (save) {
    artist.saveProfile(artist.artistName.toLowerCase().replace(/\s+/g, '_'));
    console.log(colors.green('✓ Profile saved!'));
  }

  await inquirer.prompt([
    {
      type: 'input',
      name: 'continue',
      message: 'Press Enter to continue...'
    }
  ]);
}

// Export Profile Flow
async function exportProfileFlow() {
  console.clear();
  console.log(colors.yellow('\n💾 Export Profile as JSON\n'));

  if (app.artists.length === 0) {
    console.log(colors.red('No artists to export. Create one first!'));
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: 'Press Enter to continue...'
      }
    ]);
    return;
  }

  const artistChoices = app.artists.map((artist, index) => ({
    name: artist.artistName,
    value: index
  }));

  const { artistIndex } = await inquirer.prompt([
    {
      type: 'list',
      name: 'artistIndex',
      message: 'Select an artist to export:',
      choices: artistChoices
    }
  ]);

  const artist = app.artists[artistIndex];
  const json = artist.exportProfile();

  console.log(colors.cyan('\n' + json + '\n'));

  const { copy } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'copy',
      message: 'Profile exported! Press Enter to continue...'
    }
  ]);
}

// View Saved Files Flow
async function viewSavedFilesFlow() {
  console.clear();
  console.log(colors.yellow('\n📊 Saved Files\n'));

  const configDir = path.join(__dirname, '../config');

  if (!fs.existsSync(configDir)) {
    console.log(colors.red('No saved files yet.'));
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: 'Press Enter to continue...'
      }
    ]);
    return;
  }

  const files = fs.readdirSync(configDir).filter(f => f.endsWith('.json'));

  if (files.length === 0) {
    console.log(colors.red('No saved files yet.'));
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: 'Press Enter to continue...'
      }
    ]);
    return;
  }

  console.log(colors.green(`Found ${files.length} saved file(s):\n`));
  files.forEach((file, index) => {
    const filePath = path.join(configDir, file);
    const stats = fs.statSync(filePath);
    console.log(`${index + 1}. ${colors.cyan(file)} (${stats.size} bytes)`);
  });

  const { viewFile } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'viewFile',
      message: '\nView a file?',
      default: false
    }
  ]);

  if (viewFile) {
    const { selectedFile } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedFile',
        message: 'Select a file to view:',
        choices: files
      }
    ]);

    const filePath = path.join(configDir, selectedFile);
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(colors.cyan('\n' + content + '\n'));
  }

  await inquirer.prompt([
    {
      type: 'input',
      name: 'continue',
      message: 'Press Enter to continue...'
    }
  ]);
}

// Create Split Sheet Flow
async function createSplitSheetFlow() {
  console.clear();
  console.log(colors.yellow('\n🎼 Create Song Split Sheet\n'));

  const { SongSplitSheet } = require('./songSplitSheet.js');

  const { songTitle } = await inquirer.prompt([
    {
      type: 'input',
      name: 'songTitle',
      message: 'Enter song title:',
      validate: (val) => val.length > 0 || 'Song title cannot be empty'
    }
  ]);

  const { composer } = await inquirer.prompt([
    {
      type: 'input',
      name: 'composer',
      message: 'Enter composer/artist name:',
      default: 'Various Artists'
    }
  ]);

  const split = new SongSplitSheet(songTitle, composer);

  let addMore = true;
  let writerCount = 0;

  while (addMore) {
    const { name } = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: `Enter writer name (or press Enter to finish):`,
        validate: (val) => true
      }
    ]);

    if (!name) {
      addMore = false;
      continue;
    }

    const { role } = await inquirer.prompt([
      {
        type: 'list',
        name: 'role',
        message: 'Select writer role:',
        choices: ['Composer', 'Lyricist', 'Producer', 'Arranger', 'Co-Composer', 'Other']
      }
    ]);

    const { percentage } = await inquirer.prompt([
      {
        type: 'number',
        name: 'percentage',
        message: `Enter percentage (remaining: ${100 - split.totalPercentage}%):`,
        validate: (val) => {
          if (isNaN(val)) return 'Must be a number';
          if (val <= 0) return 'Must be greater than 0';
          if (val > 100 - split.totalPercentage) return `Cannot exceed ${100 - split.totalPercentage}%`;
          return true;
        }
      }
    ]);

    const { ipi } = await inquirer.prompt([
      {
        type: 'input',
        name: 'ipi',
        message: 'Enter IPI number (optional, press Enter to skip):'
      }
    ]);

    const { pro } = await inquirer.prompt([
      {
        type: 'list',
        name: 'pro',
        message: 'Select PRO (Performing Rights Organization):',
        choices: ['ASCAP', 'BMI', 'SESAC', 'Other', 'None']
      }
    ]);

    split.addWriter(name, role, percentage, ipi || null, pro !== 'None' ? pro : null);
    writerCount++;
  }

  if (writerCount > 0) {
    split.displaySplitSheet();
    split.validate();

    const { calculateRoyalties } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'calculateRoyalties',
        message: 'Calculate royalty distribution?',
        default: false
      }
    ]);

    if (calculateRoyalties) {
      const { totalAmount } = await inquirer.prompt([
        {
          type: 'number',
          name: 'totalAmount',
          message: 'Enter total royalty amount ($):',
          validate: (val) => !isNaN(val) && val > 0 || 'Must be a valid amount'
        }
      ]);

      split.calculateRoyalties(totalAmount);
    }

    const { saveName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'saveName',
        message: 'Enter filename to save split sheet (without .json):',
        default: songTitle.toLowerCase().replace(/\s+/g, '_')
      }
    ]);

    split.saveSplitSheet(saveName);
  } else {
    console.log(colors.red('No writers added. Split sheet not saved.'));
  }

  await inquirer.prompt([
    {
      type: 'input',
      name: 'continue',
      message: 'Press Enter to continue...'
    }
  ]);
}

// Start the app
mainMenu().catch(err => {
  console.error(colors.red('Error:', err.message));
  process.exit(1);
});
