const { HttpStatusCode } = require("axios");

const articles = [
  {
    id: 1,
    title: "EU Tax Reform Updates",
    type: "pdf",
    words: 1200
  },
  {
    id: 2,
    title: "Climate Change Regulations",
    type: "html",
    words: 2500
  },
  {
    id: 3,
    title: "Data Privacy Guidelines",
    type: "pdf",
    words: 1800
  },
  {
    id: 4,
    title: "Financial Compliance Report",
    type: "html",
    words: 3200
  },
  {
    id: 5,
    title: "Healthcare Policy Changes",
    type: "pdf",
    words: 950
  },
  {
    id: 6,
    title: "Employment Law Amendments",
    type: "html",
    words: 2700
  },
  {
    id: 7,
    title: "Consumer Protection Rules",
    type: "pdf",
    words: 1450
  },
  {
    id: 8,
    title: "International Trade Update",
    type: "html",
    words: 4100
  },
  {
    id: 9,
    title: "Banking Sector Reforms",
    type: "pdf",
    words: 2200
  },
  {
    id: 10,
    title: "Energy Market Analysis",
    type: "html",
    words: 1600
  },
  {
    id: 11,
    title: "AI Governance Framework",
    type: "pdf",
    words: 3400
  },
  {
    id: 12,
    title: "Cybersecurity Standards",
    type: "html",
    words: 2900
  },
  {
    id: 13,
    title: "Insurance Industry Review",
    type: "pdf",
    words: 800
  },
  {
    id: 14,
    title: "Public Procurement Rules",
    type: "html",
    words: 2100
  },
  {
    id: 15,
    title: "Environmental Compliance Guide",
    type: "pdf",
    words: 3800
  },
  {
    id: 16,
    title: "Tax Filing Procedures",
    type: "html",
    words: 1400
  },
  {
    id: 17,
    title: "Digital Services Act Summary",
    type: "pdf",
    words: 2600
  },
  {
    id: 18,
    title: "Corporate Governance Code",
    type: "html",
    words: 1750
  },
  {
    id: 19,
    title: "Competition Law Overview",
    type: "pdf",
    words: 3100
  },
  {
    id: 20,
    title: "Cross-Border Investment Rules",
    type: "html",
    words: 2300
  }
];
 
// Count Pdf Articles
const pdfCount = articles.filter(article => article.type === "pdf").length;
console.log(pdfCount);

// Count Html Articles
const htmlCount = articles.filter(article => article.type== "html").length;
console.log(htmlCount);

// calculate total words
const totalWords = articles.reduce((sum,article) => sum + article.words,0);
console.log(totalWords);

// Find the longest article
const longArticle = articles.reduce((longest, article) => article.words > longest.words ? article : longest);
console.log(longArticle);

// Find the shortest article
const shortestArticle = articles.reduce((shortest, article) => article.words < shortest.words ? article : shortest );
console.log(shortestArticle);

// Check if any article exceeds 3500 words
const checkArticle = articles.some(article => article.words > 3500);
console.log(checkArticle);

// Check if all articles have a title
const articleTitle = articles.every(article => article.title);
console.log(articleTitle);

// Return all PDF article titles
const pdfArticles = articles.filter(article => article.type == "pdf");
console.log(pdfArticles);

// Return all HTML article titles
const htmlArticles = articles.filter(article => article.type == "html");
console.log(htmlArticles);

// Sort articles by word count (highest to lowest)
const sortArticles = articles.sort((a,b) => b.words - a.words);
console.log(sortArticles);

// Sort articles alphabetically by title
const titleArticles = [...articles].sort((a,b) => a.title.localeCompare(b.title));
console.log(titleArticles);

// Group articles by type
const groupedArticles = Object.groupBy(articles, article => article.type);
console.log(groupedArticles);

// average words
const avgWords = articles.reduce((sum,a) => sum + a.words / articles.length);
console.log(avgWords);

// Calculate average word count for PDF articles
const countpdfArticles = articles.filter(a => a.type === "pdf");
const avgPdfWords = countpdfArticles.reduce((sum, a) => sum + a.words, 0) / pdfArticles.length;
console.log(avgPdfWords);

// Calculate average word count for HTML articles.
const counthtmlArticles = articles.filter(a => a.type === "html");
const avghtmlWords = counthtmlArticles.reduce((sum, a) => sum + a.words,0) / htmlArticles.length;
console.log(avghtmlWords);

// Find all articles with more than 2500 words
const articlesWords = articles.filter(article => article.words > 2500);
console.log(articlesWords);

// Find all articles with less than 1500 words
const articlesLess = articles.filter(article => article.words < 2500);
console.log(articlesLess);

// Create a new array containing only id and title
const idTitleArray = articles.map(({ id, title }) => ({ id, title }));
console.log(idTitleArray);

// Create a new array containing title and reading time
const readingTimeArray = articles.map(a => ({title: a.title,
readingTime: Math.ceil(a.words / 200)}));

// find top 5 longest articles
const topArticles = articles.sort((a,b) => b.words - a.words).slice(0,5);
console.log(topArticles);

// calculate total pdf words
const totalPdfWords = articles
  .filter(article => article.type === "pdf")
  .reduce((sum, article) => sum + article.words, 0);
console.log(totalPdfWords);

// calculate total html words
const totalHtmlWords = articles
  .filter(article => article.type === "html")
  .reduce((sum, article) => sum + article.words, 0);
console.log(totalHtmlWords);

// Find articles between 1500 and 3000 words
const mediumArticles = articles.filter(
  article => article.words >= 1500 && article.words <= 3000);
console.log(mediumArticles);

// Get titles of PDF articles only
const pdfTitles = articles
  .filter(article => article.type === "pdf")
  .map(article => article.title);
console.log(pdfTitles);

// Get titles of HTML articles only
const htmlTitles = articles
  .filter(article => article.type === "html")
  .map(article => article.title);
console.log(htmlTitles);

// Adding new property called pages
const pages = articles.map(article => ({
  ...article,
  pages: Math.ceil(article.words / 500)
}));
console.log(pages);

// Total reading time of all articles
const totalReadingTime = articles.reduce(
  (sum, article) => sum + Math.ceil(article.words / 200),0);
console.log(`${totalReadingTime} minutes`);

// generate summary report
const summary = {
totalArticles: pdfCount + htmlCount,
pdfCount: pdfCount,
htmlCount: htmlCount,
totalWords: totalWords,
averagewords: totalWords / articles.length,
longestarticle: longArticle,
shortestArticle: shortestArticle
};
console.log(summary);