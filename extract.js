const fs = require('fs'),
      PDFParser = require("pdf2json"),
      toc = require('markdown-toc');

const manualCleanup = require('./manualCleanup');

const pdfParser = new PDFParser();


pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
pdfParser.on("pdfParser_dataReady", pdfData => {

  const cleanedDataPromise = () => {
    return new Promise((resolve, reject) => {
      // Page: Array<Text>
      // Pages: Array<Page>
      const listOfPages = pdfData.formImage.Pages.map((page) => {
        return page.Texts.map((text, index, array) => {
          // console.log(text);
          if(index === 0) {
            return `## ${decodeURIComponent(text.R[0].T)}`
          }
          return decodeURIComponent(text.R[0].T);
        }).join('').replace(//g, '\n\n* ');
      });

      let resolutionCleanedList = listOfPages.map((page) => {
        return page
          .replace('WHEREAS:', 'WHEREAS ')
          .replace('WHEREAS', '\n **WHEREAS** \n')
          .replace(/BE IT RESOLVED/g, '\n\n**BE IT RESOLVED** ')
          .replace(/BE IT FURTHER RESOLVED/g, '\n\n**BE IT FURTHER RESOLVED** ');
      })

      let resolutionsWithNoToc = resolutionCleanedList.slice(2);
      // const stageTwoCleanData = () => {
      //   return listOfPages().map((page) => {
      //
      //   });
      // }
      resolve(resolutionsWithNoToc);
    });
  }

  cleanedDataPromise().then((cleanData) => {
    console.log(cleanData);

    let titledMdPolicies = cleanData.map((policy) => {
      let title = policy.substring(policy.indexOf("#")+2,policy.indexOf("\n")).trim();
      let policyWithRemovedTitle = policy.replace(policy.substring(policy.indexOf("#"),policy.indexOf("\n")), '');

      manualCleanup.forEach((issue) => {
        // console.log(issue);
        const rawString = issue[0];
        const fixedString = issue[1];
        // console.log(`FIND: `, outputTxt.indexOf(rawString));
        policyWithRemovedTitle = policyWithRemovedTitle.replace(rawString, fixedString);
        title = title.replace(rawString, fixedString);
      })

      const slug = `/policy/${title.trim().toLowerCase().replace(/ /g, '-').replace(/[^a-zA-Z0-9-_]/g, '')}`;
      const titleSlug = `---
path: "${slug}"
date: "${new Date()}"
title: "${title}"
---
      `;

      return {
        slug,
        title,
        markdown: `${titleSlug}
${policyWithRemovedTitle}`
      }
    });

    titledMdPolicies.forEach(({title, slug, markdown}) => {
      let fileName = markdown.substring(markdown.indexOf(`"`)+2,markdown.indexOf("\n"));

      fs.writeFile(`.${slug}.md`, markdown, 'utf8', (err) => {
        console.log('WRITEFILE ERROR: ', err);
      });
    })



    let outputTxt = titledMdPolicies.join('\n\n ------------------- \n\n');

    manualCleanup.forEach((issue) => {
      // console.log(issue);
      const rawString = issue[0];
      const fixedString = issue[1];
      // console.log(`FIND: `, outputTxt.indexOf(rawString));
      outputTxt = outputTxt.replace(rawString, fixedString);
    })



    const outputWithToc =
    `
# 2018 Liberal Policy Resolutions

## Table of Content:

${toc(outputTxt).content}

-------------------

${outputTxt}

    `

    // console.log(outputWithToc);

    fs.writeFile("./LPC_Policy.md", outputWithToc, 'utf8', (err) => {
      console.log('WRITEFILE ERROR: ', err);
    });
    fs.writeFile("./README.md", outputWithToc, 'utf8', (err) => {
      console.log('WRITEFILE ERROR: ', err);
    });
  })

});

pdfParser.loadPDF("./2018_Liberal_Policy_Resolutions.pdf", (pdfData) => {
  console.log(pdfData);
});
