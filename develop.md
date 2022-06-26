## Deploying to GitHub pages
We can deploy the app to GitHub pages.  We use:

```
npm run deploy
```

See also:
* [react-gh-pages](https://github.com/gitname/react-gh-pages)

## Running ngrok for testing
I use ngrok to provide an interface to the testing environment

ngrok http http://localhost:3000

We can backup the source using:

zip -r "$(date).zip" file-browser
