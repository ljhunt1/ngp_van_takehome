# Follow-up Questions

### How long, roughly, did you spend working on this project? This won’t affect your evaluation; it helps us norm our problems to our expected time to complete them.

5-6 hours or so(!). Bear in mind

- I am pretty rusty, it has been 6+ months since I've interacted with an HTTP server or written typescript
- Typescript is probably overkill for this job, and I spent a lot of time finnicking with types for no reason. Python would have been faster to write, and arguably better suited to a script this short. But I enjoyed the TS review.
- I was enjoying myself and probably went overboard. Perfectionism is bad!
- That said, I think that this was a pretty substantial ask and should have taken 3 hours. Read the API docs, make sure AUTH works, serially call three different API endpoints, handle pagination, make sure it works, clean it up, write a readme.

### Give the steps needed to deploy and run your code, written so that someone else can follow and execute them.

**Setup Environment**

1. [Setup node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
2. [Setup typescript](https://www.typescriptlang.org/download). I did this globally with `npm install -g typescript`

**Run the project**

1. cd into the project directory and run `npm install`
2. Copy API Key into line 6 of script.ts
3. run `tsc` to compile script.ts to script.js
4. run the script with `node script.js`
5. see the report is report.txt

### What could you do to improve your code for this project if you had more time? Could you make it more efficient, easier to read, more maintainable? If it were your job to run this report monthly using your code, could it be made easier or more flexible? Give specifics where possible.

I honestly wouldn't do much - I already spent lots of time on this. The considerations below are all minor.

Performance improvements:

- The vast majority of the script's time is taken dispatching tons of GET requests. If any of server's responses could be cached locally between runs, that would improve performance. Unfortunately, statistics like clicks are always changing so they can't be cached. Only the email names and ID's themselves could be cached, but we still need to check for new ones.
- We could parallel dispatch ALL requests for variant statistics. Currently we only parallelize those that are for the same email.

Ease of reading / use:

- Add an informative console.log() after each .then(), just so you know the thing is working and have an easier time debugging it?
- Typescript types might be overkill for a script this short? They do help with maintenance, and do make writing the code a lot easier. But they can be a hassle to set up correctly, and end up leading to long names and clutter. I'm on the fence. Remove the types and you might regret it later.

Misc:

- Don't simply paste the API key into the script source code (I'm not sure the right way to do this, but I'm sure there's a right way)

### Outline a testing plan for this report, imagining that you are handing it off to someone else to test. What did you do to test this as you developed it? What kinds of automated testing could be helpful here?

In terms of testing I did while writing the script, I simply ran it end to end periodically as I was writing, once after I built out each step in the chain of .then(). This was more than enough to catch bugs, but since I was only looking at the data the server gave me it's very likely the script would fail on corner cases.

Testing plan:

1. Write .json files to serve as test inputs to the script. Do boundary tests - lots of emails, emails with no subject, emails with no variants, non-ASCII names, etc. As weird as possible that's still feasible.
2. For each input .json, write an output .txt representing the expected report.
3. Modify script to optionally take input from a target .json instead of from HTTP. Maybe this could be a flag somewhere.
4. Create a test program that runs the script once per .json file, diffs the output with the corresponding .txt file, and logs something sensible like "Test case passed: non-ASCII names" or "Test case failed: non-ASCII names" and then the diff.

It is possible there is a library that makes the above easy or otherwise reduces the work. No need to reinvent the wheel, so probably step 0 is see if such a library exists, and if so learn it. Right now I don't know about it.
