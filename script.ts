import { encode } from "base-64";
import fetch from "node-fetch";
import { writeFileSync } from "fs";

// NOTE: Delete API key before sharing file, including `git commit`
const API_USER: string = "apiuser";
const API_KEY: string = "";
const API_BASE_URL: string = "https://api.myngp.com/v2/";
const API_AUTH_HEADER = `Basic ${encode(`${API_USER}:${API_KEY}`)}`;
const OUTPUT_FILE = "report.txt";

type Email = {
  emailMessageId: number;
  name: string;
};

type EmailWithStatistics = Email & {
  variants: {
    emailMessageId: number;
    emailMessageVariantId: number;
    name: string;
    subject: string;
  }[];
  statistics: {
    recipients: number;
    opens: number;
    clicks: number;
    unsubscribes: number;
    bounces: number;
    topVariant?: string; // this one we compute, not returned by the server
  };
};

type EmailVariant = {
  emailMessageId: number;
  emailMessageVariantId: number;
  name: string;
  subject: string;
  statistics: {
    startSentOn: string;
    endSentOn: string;
    recipients: number;
    opens: number;
    clicks: number;
    unsubscribes: number;
    bounces: 1;
  };
};

type GetEmailsResponse = {
  items: Email[];
  count: number;
};

type getEmailByIdResponse = EmailWithStatistics;

type GetEmailVariantByIdResponse = EmailVariant;

const getRequestNVPVanEmailServer = async (url: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: API_AUTH_HEADER,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Error: NGP VAN email server returned HTTP status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.log(
      `Error with GET request to NGP VAN email server ${API_BASE_URL}${url}`
    );
    throw error;
  }
};

// GET request /broadcastEmails. Fetches a single page of email names and ID's
const getEmails = async (top = 25, skip = 0) => {
  return (await getRequestNVPVanEmailServer(
    `/broadcastEmails?$top=${top}&$skip=${skip}`
  )) as GetEmailsResponse;
};

// GET request /broadcastEmails **for all pages**. Will dispatch several
// GET requests, serially
const getEmailsAllPages = async (top = 25) => {
  let emails: Email[] = [];
  let skip = 0;
  let lastRequestCount = top;
  while (lastRequestCount == top) {
    let res = await getEmails(top, skip);
    lastRequestCount = res.count;
    skip += lastRequestCount;
    emails.push(...res.items);
  }
  return emails;
};

// GET request /broadcastEmails/{id}. Retrieves statistics for a single email.
const getEmailById = async (id: number) => {
  return (await getRequestNVPVanEmailServer(
    `/broadcastEmails/${id}?$expand=statistics`
  )) as getEmailByIdResponse;
};

// GET request broadcastEmails/{id}/variants/{variantid}. Retrieves statistics
// for a single variant
const getEmailVariantById = async (id: number, variantId: number) => {
  return (await getRequestNVPVanEmailServer(
    `/broadcastEmails/${id}/variants/${variantId}?$expand=statistics`
  )) as GetEmailVariantByIdResponse;
};

// Given an email with stats, compute the top variant and store its name
// in email.statistics.topVariant. Return email. Note this mutates the input
// Note too this sends several GET requests
const computeTopVariant = async (email: EmailWithStatistics) => {
  // Parallel GET requests for variant stats
  const variantStatistics = await Promise.all(
    email.variants.map((v) =>
      getEmailVariantById(email.emailMessageId, v.emailMessageVariantId)
    )
  );
  // Compute top variant
  let maxPercentOpens = 0;
  let topVariant: string = "";
  for (const v of variantStatistics) {
    const percentOpens = v.statistics.opens / v.statistics.recipients;
    if (percentOpens >= maxPercentOpens) {
      maxPercentOpens = percentOpens;
      topVariant = v.name;
    }
  }
  // Store top variant in email and return email
  email.statistics.topVariant = topVariant;
  return email;
};

// Given an array of emails with statistics, return the main report
const makeReport = (emails: EmailWithStatistics[]): string => {
  const headerRow =
    "Email Message ID, Email Name, Recipients, Opens, Clicks, Unsubscribes, Bounces, Top Variant";
  emails.sort((a, b) => a.emailMessageId - b.emailMessageId);
  return (
    headerRow +
    "\n" +
    emails
      .map((e) =>
        [
          e.emailMessageId,
          e.name,
          e.statistics.recipients,
          e.statistics.opens,
          e.statistics.clicks,
          e.statistics.unsubscribes,
          e.statistics.bounces,
          e.statistics.topVariant ?? "",
        ].join(",")
      )
      .join("\n")
  );
};

// Get the names and ID's of all emails
getEmailsAllPages()
  // For each ID found, get statistics. Promise.all sends several async GET requests in parallel
  .then(async (emails: Email[]) => {
    return await Promise.all(emails.map((e) => getEmailById(e.emailMessageId)));
  })
  // Compute the top variant for each email
  .then(async (emailsWithStats: EmailWithStatistics[]) => {
    return await Promise.all(emailsWithStats.map(computeTopVariant));
  })
  .then((emailsWithStats: EmailWithStatistics[]) => {
    const report = makeReport(emailsWithStats);
    writeFileSync(OUTPUT_FILE, report, "utf-8");
  });
