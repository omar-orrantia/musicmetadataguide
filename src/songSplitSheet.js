/**
 * Song Split Sheet Module
 * Manages songwriting credits, percentages, and royalty distribution
 * for collaborative music projects with multiple writers
 */

class SongSplitSheet {
  constructor(songTitle, composer = 'Unknown') {
    this.songTitle = songTitle;
    this.composer = composer;
    this.writers = [];
    this.totalPercentage = 0;
    this.createdAt = new Date();
  }

  // Add a writer to the split sheet
  addWriter(name, role, percentage, ipi = null, pro = null) {
    if (this.totalPercentage + percentage > 100) {
      console.log(`⚠ Cannot add ${name}: Total would exceed 100%`);
      return false;
    }

    const writer = {
      id: this.writers.length + 1,
      name,
      role,           // 'Composer', 'Lyricist', 'Producer', 'Arranger', etc.
      percentage,
      ipi,            // Interested Parties Information
      pro,            // Performing Rights Organization (ASCAP, BMI, SESAC, etc.)
      addedAt: new Date()
    };

    this.writers.push(writer);
    this.totalPercentage += percentage;
    console.log(`✓ ${name} (${role}) added: ${percentage}%`);
    return true;
  }

  // Validate split sheet (must total 100%)
  validate() {
    if (this.totalPercentage !== 100) {
      console.log(`⚠ Split sheet incomplete: ${this.totalPercentage}% allocated (need 100%)`);
      return false;
    }
    if (this.writers.length === 0) {
      console.log(`⚠ No writers added to split sheet`);
      return false;
    }
    console.log(`✅ Split sheet validated: 100% allocated across ${this.writers.length} writers`);
    return true;
  }

  // Display split sheet
  displaySplitSheet() {
    console.log(`\n========== SONG SPLIT SHEET ==========`);
    console.log(`Song: ${this.songTitle}`);
    console.log(`Composer: ${this.composer}`);
    console.log(`Created: ${this.createdAt.toLocaleDateString()}`);
    console.log(`\nWriters & Contributions:`);
    console.log('# | Name                 | Role           | Share | IPI          | PRO');
    console.log('-'.repeat(80));

    this.writers.forEach(w => {
      const ipi = w.ipi || 'N/A';
      const pro = w.pro || 'N/A';
      const num = String(w.id).padEnd(1);
      const name = w.name.padEnd(20);
      const role = w.role.padEnd(14);
      const pct = String(w.percentage + '%').padEnd(5);
      const ipiStr = ipi.padEnd(12);
      console.log(`${num} | ${name} | ${role} | ${pct} | ${ipiStr} | ${pro}`);
    });

    console.log('-'.repeat(80));
    const totalStr = String(this.totalPercentage + '%').padStart(5);
    console.log(`TOTAL: ${totalStr}`);
    console.log(`=====================================\n`);
  }

  // Calculate royalty distribution
  calculateRoyalties(totalRoyalties) {
    console.log(`\n💰 ROYALTY DISTRIBUTION (Total: $${totalRoyalties})`);
    console.log('-'.repeat(50));

    const distribution = this.writers.map(w => {
      const amount = (totalRoyalties * w.percentage) / 100;
      return {
        ...w,
        royaltyAmount: amount.toFixed(2)
      };
    });

    distribution.forEach(w => {
      const name = w.name.padEnd(20);
      console.log(`${name} ${w.percentage}% = $${w.royaltyAmount}`);
    });

    console.log('-'.repeat(50));
    const total = distribution.reduce((sum, w) => sum + parseFloat(w.royaltyAmount), 0);
    console.log(`TOTAL DISTRIBUTED: $${total.toFixed(2)}\n`);

    return distribution;
  }

  // Export to JSON
  exportToJSON() {
    return JSON.stringify({
      songTitle: this.songTitle,
      composer: this.composer,
      createdAt: this.createdAt,
      totalPercentage: this.totalPercentage,
      writers: this.writers,
      isValid: this.validate()
    }, null, 2);
  }

  // Save split sheet to file
  saveSplitSheet(filename) {
    const fs = require('fs');
    const path = require('path');
    const configDir = path.join(__dirname, '../config');

    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const filepath = path.join(configDir, `${filename}.json`);
    fs.writeFileSync(filepath, this.exportToJSON());
    console.log(`✓ Split sheet saved to: ${filepath}`);
  }
}

module.exports = { SongSplitSheet };
