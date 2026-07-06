const fs = require("fs");
const path = require("path");

// folder path
const folderPath = "/Users/Elwin.Roy/Documents/nodeDemo/Sample";

// Counting files recursively
function countFiles(folderPath) {
  let fileCount = 0;

  const entries = fs.readdirSync(folderPath, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    const fullPath = path.join(folderPath, entry.name);

    if (entry.isDirectory()) {
      fileCount += countFiles(fullPath);
    } else {
      fileCount++;
    }
  }

  return fileCount;
}

// Counting folders recursively
function countFolders(folderPath) {
  let folderCount = 0;

  const entries = fs.readdirSync(folderPath, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    const fullPath = path.join(folderPath, entry.name);

    if (entry.isDirectory()) {
      folderCount++; // Count this folder
      folderCount += countFolders(fullPath); // Count subfolders
    }
  }

  return folderCount;
}

// Calculate total folder size recursively
function getFolderSize(folderPath) {
  let totalSize = 0;

  const entries = fs.readdirSync(folderPath, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    const fullPath = path.join(folderPath, entry.name);

    if (entry.isDirectory()) {
      totalSize += getFolderSize(fullPath);
    } else {
      totalSize += fs.statSync(fullPath).size;
    }
  }

  return totalSize;
}

// Display results
console.log("Folder:", folderPath);
console.log("Total Files:", countFiles(folderPath));
console.log("Total Folders:", countFolders(folderPath));
console.log("Total Size:", getFolderSize(folderPath), "bytes");