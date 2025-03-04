[![.github/workflows/deploy.yml](https://github.com/eonist/proxify/actions/workflows/deploy.yml/badge.svg)](https://github.com/eonist/proxify/actions/workflows/deploy.yml)

# proxify

> Proxify any website

## Problem:
- You can now chat with any website via lechat, chatgpt, pplx etc. But only if the website is whitelisted by the ervices. Much of the web remains blacklisted.

## Solution:
- archive.ph Is a great proxy to read restricted parts of the web, be it content walls, or geo location blocks. 
- But archive.ph is blacklisted by the major gpt chat services
- So create your own whitelisted proxy via github. Fork this repo and just prepend any website you want to chat with

## How it works. 
1. Fetch content fro archive.ph
2. Render the content on this github website
3. Gpt sees only a github website. which is whitelisted by the gpt chat providers ✨

## How to use it:

**Prepend any url with:**

`https://eonist.github.io/proxify/?url=https://en.wikipedia.org/wiki/GitHub`

**Chat with the website:**

`Use chatgpt, lechat or perplexity`

**Prompts:**
`Summaries this: https://eonist.github.io/proxify/?url=https://en.wikipedia.org/wiki/GitHub`

`What are the main points here: https://eonist.github.io/proxify/?url=https://en.wikipedia.org/wiki/GitHub`

## Enable github pages via github actions:

GitHub has introduced a new option to configure GitHub Pages to be built and deployed via GitHub Actions. This allows for more flexibility and control over the build and deployment process, leveraging the power of GitHub Actions workflows.

### How to Enable GitHub Pages via GitHub Actions:

1. **Go to Repository Settings**: Navigate to your GitHub repository and click on the "Settings" tab.

2. **Locate the Pages Section**: Scroll down to find the "Pages" section in the settings sidebar.

3. **Select GitHub Actions as the Source**:
   - In the "Source" dropdown, you should see an option to select "GitHub Actions." This option allows you to use a GitHub Actions workflow to build and deploy your site.

4. **Save Changes**: After selecting "GitHub Actions," click "Save" to apply the changes.

5. **Configure Your Workflow**: Ensure that your GitHub Actions workflow (like the one you provided) is set up to build and deploy your site. The workflow should include steps to build your site and deploy it to the `gh-pages` branch or another branch/folder as needed.

6. **Check Deployment**: Once configured, your site will be built and deployed according to the workflow you have set up. You can check the URL provided in the Pages section to see your live site.

### Benefits of Using GitHub Actions for GitHub Pages:
- **Custom Build Process**: You can define a custom build process using any tools or scripts you need.
- **Automated Deployment**: Automatically deploy your site whenever changes are pushed to the repository.
- **Integration with CI/CD**: Easily integrate with other CI/CD processes and tools.

By selecting GitHub Actions as the source, you gain more control over how your site is built and deployed, making it easier to manage complex build processes or integrate with other tools and services.
