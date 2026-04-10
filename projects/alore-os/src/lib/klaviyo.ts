import axios from "axios";

const API_KEY = process.env.KLAVIYO_API_KEY ?? "";
const BASE_URL = "https://a.klaviyo.com/api";

export async function getSubscriberCount(): Promise<number> {
  if (!API_KEY) return 0;

  const res = await axios.get(`${BASE_URL}/profiles/`, {
    headers: {
      Authorization: `Klaviyo-API-Key ${API_KEY}`,
      accept: "application/json",
      revision: "2024-02-15",
    },
    params: {
      filter:
        "equals(subscriptions.email.marketing.can_receive_email_marketing,true)",
      "page[size]": 1,
    },
  });

  return res.data.meta?.total ?? 0;
}
