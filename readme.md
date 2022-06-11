# Follow-up Questions

### How long, roughly, did you spend working on this project? This won’t affect your evaluation; it helps us norm our problems to our expected time to complete them.

5 hours or so(!). Bear in mind

- I am pretty rusty, it has been 6+ months since I've interacted with an HTTP server or written typescript
- Typescript is probably overkill for this job, and I spent a lot of time finnicking with types for no reason. Python would have been faster, but less fun
- I was enjoying myself and probably went overboard

### Give the steps needed to deploy and run your code, written so that someone else can follow and execute them.

**Setup Environment**

1. Setup npm (TODO)
2. Setup node (TODO)
3. Setup tyepscript (TODO)

**Run the project**

1. cd into the project directory and run `npm install`
2. Copy API Key into line 6 of script.ts
3. run `tsc` to compile script.ts to script.js
4. run the script with `node script.js`

### What could you do to improve your code for this project if you had more time? Could you make it more efficient, easier to read, more maintainable? If it were your job to run this report monthly using your code, could it be made easier or more flexible? Give specifics where possible.

I honestly wouldn't do much - I already spent lots of time on this. The considerations below are all minor.

Performance improvements:

- The vast majority of the script's time is taken dispatching tons of GET requests. If any of server's responses could be cached locally between runs, that would improve performance. Unfortunately, statistics like clicks are always changing so they can't be cached. Only the email names and ID's themselves could be cached, but we still need to check for new ones.
- We could parallel dispatch ALL requests for variant statistics. Currently we only parallelize those that are for the same email.

Ease of reading:

- Typescript types might be overkill for a script this short? They do help with maintenance, and do make writing the code a lot easier. But they can be a hassle to set up correctly, and end up leading to long names and clutter. I'm on the fence. Remove the types and you might regret it later.

Misc:

- Don't simply type the API key into the script source code (I'm not sure the right way to do this, but I'm sure there's a right way)

### Outline a testing plan for this report, imagining that you are handing it off to someone else to test. What did you do to test this as you developed it? What kinds of automated testing could be helpful here?

In terms of testing I did while writing the script, I simply ran it end to end periodically as I was writing, once after I built out each step in the chain of .then(). This was more than enough to catch bugs, but since I was only looking at the data the server gave me it's very likely the script would fail on corner cases.

Testing plan:

1. Write static email datasets as json files. Test boundaries - lots of emails, emails with no subject, emails with no variants, non-ASCII names, etc. As weird as possible that's still feasible.
2. Write expected output reports as .txt files. One per json input.
3. Modify script to optionally take input from a target .json files instead of HTTP. Maybe this could be a flag somewhere.
4. Create test program which runs the script once per .json file, diffs the output with the corresponding .txt file, and logs something sensible like "Test case passed: non-ASCII names" or "Test case failed: non-ASCII names" and then the diff.
   It is possible there is a library that makes the above easy. Probably step 0 is see if such a library exists, and if so learn it.
