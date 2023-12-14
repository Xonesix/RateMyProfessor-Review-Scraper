const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
const fs = require('fs');
const Papa = require('papaparse');

const waitTime = 300;
// enter csv path where './name.csv' is
const csvPath = './name.csv'
const fileContent = fs.readFileSync(csvPath, 'utf8');
const results = Papa.parse(fileContent, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,

});

const namesArray = results.data.map(row => row.Name);
const idArray = [];

puppeteer.use(AdblockerPlugin());

async function findProfessorID(yourArrayOfNames, universityName, csvName) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    try {
        await page.goto("https://www.ratemyprofessors.com");

        const textToFind = 'Close';
        const [element] = await page.$x(`//*[contains(text(), '${textToFind}')]`);
        if (element) {
            const boundingBox = await element.boundingBox();
            if (boundingBox) {
                console.log("Success clicking");
                await page.mouse.click(boundingBox.x + boundingBox.width / 2, boundingBox.y + boundingBox.height / 2);
            } else {
                console.log(`Couldn't get the bounding box for the element with text: ${textToFind}`);
            }
        } else {
            console.log(`No element found with text: ${textToFind}`);
        }
        
        await page.type('[aria-label="search"]', universityName);
        await page.waitForTimeout(500);
        await page.keyboard.press('Enter');
        for (const name of yourArrayOfNames) {
            await page.waitForTimeout(waitTime);
    
            await page.focus('[aria-label="search"]');
            for (let i = 0; i <= 100; i++) {
                await page.keyboard.press('Backspace');
            }
            
            await page.type('[aria-label="search"]', name);
            await page.keyboard.press('Enter');
            await page.waitForTimeout(100);
            
            // ... (rest of the loop code)
            await page.keyboard.press('Enter');
            await page.waitForTimeout(500);
            
            try {
                const textToFind = 'QUALITY';
                const [element] = await page.$x(`//*[contains(text(), '${textToFind}')]`);
            
                if (element) {
                    const boundingBox = await element.boundingBox();
                    if (boundingBox) {
                        await page.mouse.click(boundingBox.x + boundingBox.width / 2, boundingBox.y + boundingBox.height / 2);
                        
                    } else {
                        console.log(`Couldn't get the bounding box for the element with text: ${textToFind}`);
                    }
                } else {
                    console.log(`No element found with text: ${textToFind}`);
                }
            } catch (error) {
                console.error(`Failed to find or simulate a mouse click on the element with text: ${textToFind}`, error);
            }
            await page.waitForTimeout(waitTime);
            // Extract ID from the URL and add to the idArray
            const url = await page.url();
            try {
                const matches = url.match(/(\d+)$/);
                if (matches && matches[0]) {
                    idArray.push(matches[0]);
                    console.log(matches[0]);
                } else {
                    console.log(`No ID found in URL ${url}`);
                    idArray.push("Not Found");
                }
            } catch (error) {
                console.log(`Failed to extract ID from URL ${url}:`, error.message);
                idArray.push("Error");
            }
        }

    } catch (error) {
        console.error(`An error occurred during processing: ${error.message}`);
        const updatedData = yourArrayOfNames.map((name, index) => {
            return {
                Name: name,
                ID: idArray[index] || "Not Found"
            };
        });
        const csvContent = Papa.unparse(updatedData);
        fs.writeFileSync(csvName, csvContent);
        console.log("Data saved to CSV.");

        throw error;
    } finally {
        // Save to CSV if there were no errors during processing
        const updatedData = yourArrayOfNames.map((name, index) => {
            return {
                Name: name,
                ID: idArray[index] || "Not Found"
            };
        });
        const csvContent = Papa.unparse(updatedData);
        fs.writeFileSync(csvName, csvContent);
        console.log("Data saved to CSV.");

        await browser.close();
    }
}
// Enter Whatever Path You Want For New Name **Don't Touch `namesArray`**
// findProfessorID(namesArray, "Your University Name", pathToNewCSV(can be csvPath));
