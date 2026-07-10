#!/usr/bin/env node

/**
 * Music Metadata Guide - Main Application
 * Purpose: Empower independent artists with metadata management tools
 * Version: 0.2.0
 */

const fs = require('fs');
const path = require('path');

// Artist Profile Class
class ArtistProfile {
  constructor(artistName) {
    this.artistName = artistName;
    this.metadata = {
      isrc: null,           // International Standard Recording Code
      ipi: null,            // Interested Parties Information
      iswc: null,           // International Standard Musical Work Code
      tunecore: null,       // TuneCore ID
      spotify: null,        // Spotify Artist ID
      apple: null,          // Apple Music ID
      soundcloud: null,     // SoundCloud ID
      bandcamp: null,       // Bandcamp URL
      youtube: null,        // YouTube Channel ID
      tidal: null,          // TIDAL Artist ID
      amazonmusic: null,    // Amazon Music ID
      createdAt: new Date(),
      lastUpdated: new Date()
    };
  }

  // Register ISRC Code
  registerISRC(code) {
    this.metadata.isrc = code;
    this.metadata.lastUpdated = new Date();
    console.log(`✓ ISRC registered: ${code}`);
  }

  // Register IPI
  registerIPI(code) {
    this.metadata.ipi = code;
    this.metadata.lastUpdated = new Date();
    console.log(`✓ IPI registered: ${code}`);
  }

  // Register ISWC
  registerISWC(code) {
    this.metadata.iswc = code;
    this.metadata.lastUpdated = new Date();
    console.log(`✓ ISWC registered: ${code}`);
  }

  // Add streaming platform profile
  addStreamingProfile(platform, profileId) {
    // Map common platform names to metadata keys
    const platformMap = {
      'spotify': 'spotify',
      'apple': 'apple',
      'apple music': 'apple',
      'soundcloud': 'soundcloud',
      'sound cloud': 'soundcloud',
      'bandcamp': 'bandcamp',
      'youtube': 'youtube',
      'you tube': 'youtube',
      'tidal': 'tidal',
      'amazonmusic': 'amazonmusic',
      'amazon music': 'amazonmusic',
      'amazon': 'amazonmusic',
      'tunecore': 'tunecore',
      'tune core': 'tunecore'
    };

    const platformKey = platformMap[platform.toLowerCase().trim()];
    
    if (platformKey && this.metadata.hasOwnProperty(platformKey)) {
      this.metadata[platformKey] = profileId;
      this.metadata.lastUpdated = new Date();
      console.log(`✓ ${platform} profile linked: ${profileId}`);
      return true;
    } else {
      console.log(`⚠ Platform not recognized: ${platform}`);
      console.log(`   Available: Spotify, Apple Music, YouTube, SoundCloud, Bandcamp, TIDAL, Amazon Music, TuneCore`);
      return false;
    }
  }

  // Export profile as JSON
  exportProfile() {
    return JSON.stringify(this.metadata, null, 2);
  }

  // Save profile to file
  saveProfile(filename) {
    const configDir = path.join(__dirname, '../config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    const filepath = path.join(configDir, `${filename}.json`);
    fs.writeFileSync(filepath, this.exportProfile());
    console.log(`✓ Profile saved to: ${filepath}`);
  }

  // Display profile summary
  displaySummary() {
    console.log(`\n========== ARTIST PROFILE SUMMARY ==========`);
    console.log(`Artist: ${this.artistName}`);
    console.log(`Created: ${this.metadata.createdAt}`);
    console.log(`Last Updated: ${this.metadata.lastUpdated}`);
    console.log(`\nRegistered Codes:`);
    console.log(`  ISRC: ${this.metadata.isrc || 'Not registered'}`);
    console.log(`  IPI: ${this.metadata.ipi || 'Not registered'}`);
    console.log(`  ISWC: ${this.metadata.iswc || 'Not registered'}`);
    console.log(`\nStreaming Platforms:`);
    console.log(`  Spotify: ${this.metadata.spotify || 'Not linked'}`);
    console.log(`  Apple Music: ${this.metadata.apple || 'Not linked'}`);
    console.log(`  SoundCloud: ${this.metadata.soundcloud || 'Not linked'}`);
    console.log(`  Bandcamp: ${this.metadata.bandcamp || 'Not linked'}`);
    console.log(`  YouTube: ${this.metadata.youtube || 'Not linked'}`);
    console.log(`  TIDAL: ${this.metadata.tidal || 'Not linked'}`);
    console.log(`  Amazon Music: ${this.metadata.amazonmusic || 'Not linked'}`);
    console.log(`==========================================\n`);
  }

  // Get metadata completion percentage
  getCompletionPercentage() {
    const fields = Object.keys(this.metadata).filter(k => k !== 'createdAt' && k !== 'lastUpdated');
    const filled = fields.filter(k => this.metadata[k] !== null).length;
    return Math.round((filled / fields.length) * 100);
  }

  // Display metadata checklist
  displayChecklist() {
    const completion = this.getCompletionPercentage();
    console.log(`\n📋 METADATA COMPLETION: ${completion}%`);
    console.log(`[${this.getProgressBar(completion)}]\n`);
    
    console.log(`Essential Codes:`);
    console.log(`  ${this.metadata.isrc ? '✅' : '❌'} ISRC Code`);
    console.log(`  ${this.metadata.ipi ? '✅' : '❌'} IPI Number`);
    console.log(`  ${this.metadata.iswc ? '✅' : '❌'} ISWC Code`);
    
    console.log(`\nMajor Streaming Platforms:`);
    console.log(`  ${this.metadata.spotify ? '✅' : '❌'} Spotify`);
    console.log(`  ${this.metadata.apple ? '✅' : '❌'} Apple Music`);
    console.log(`  ${this.metadata.youtube ? '✅' : '❌'} YouTube`);
    console.log(`  ${this.metadata.tidal ? '✅' : '❌'} TIDAL`);
    console.log(`  ${this.metadata.amazonmusic ? '✅' : '❌'} Amazon Music\n`);
  }

  // Progress bar helper
  getProgressBar(percentage) {
    const filled = Math.round(percentage / 5);
    return '█'.repeat(filled) + '░'.repeat(20 - filled);
  }
}

// Main Application
class MusicMetadataApp {
  constructor() {
    this.artists = [];
    this.configDir = path.join(__dirname, '../config');
    this.loadProfiles();
  }

  createArtist(name) {
    const artist = new ArtistProfile(name);
    this.artists.push(artist);
    console.log(`\n✓ Artist profile created: ${name}`);
    return artist;
  }

  loadProfiles() {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
      return;
    }
    const files = fs.readdirSync(this.configDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    if (jsonFiles.length > 0) {
      console.log(`✓ Found ${jsonFiles.length} existing profile(s)`);
    }
  }

  listArtists() {
    console.log(`\n========== REGISTERED ARTISTS ==========`);
    if (this.artists.length === 0) {
      console.log(`No artists registered yet.`);
    } else {
      this.artists.forEach((artist, index) => {
        console.log(`${index + 1}. ${artist.artistName} (${artist.getCompletionPercentage()}% complete)`);
      });
    }
    console.log(`=========================================\n`);
  }
}

// Initialize and Demo
function main() {
  console.log('\n🎵 Welcome to Music Metadata Guide 🎵');
  console.log('Sync Your Metadata. Secure Your Royalties.\n');

  const app = new MusicMetadataApp();

  // Demo: Create sample artist profile
  const artist = app.createArtist('Independent Artist Demo');
  
  // Demo: Register codes
  artist.registerISRC('US-ABC-21-00001');
  artist.registerIPI('00123456789');
  artist.registerISWC('T-345.246.317-1');
  
  // Demo: Add streaming platforms (NOW FIXED!)
  artist.addStreamingProfile('Spotify', 'spotify:artist:1A2B3C4D5E6F');
  artist.addStreamingProfile('Apple', 'apple-music:artist:abc123');
  artist.addStreamingProfile('Apple Music', 'apple-music:artist:abc123');
  artist.addStreamingProfile('YouTube', 'UCxxxxxxxxxxxxx');
  artist.addStreamingProfile('SoundCloud', 'soundcloud:user123');
  artist.addStreamingProfile('Bandcamp', 'https://artist.bandcamp.com');
  artist.addStreamingProfile('TIDAL', 'tidal:artist:12345');
  artist.addStreamingProfile('Amazon Music', 'amazon-music:artist:xyz');
  
  // Display profile
  artist.displaySummary();
  
  // Display checklist
  artist.displayChecklist();
  
  // Save profile
  artist.saveProfile('demo_artist_profile');
  
  app.listArtists();
  
  console.log(`📚 Next Steps:`);
  console.log(`   1. Create artist profiles for your music`);
  console.log(`   2. Register your ISRC, IPI, and ISWC codes`);
  console.log(`   3. Link your streaming platform profiles`);
  console.log(`   4. Export and backup your metadata`);
  console.log(`   5. Monitor your royalty registration\n`);
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { ArtistProfile, MusicMetadataApp };
