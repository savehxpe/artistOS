import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  let channelId = searchParams.get("channelId");
  const accessToken = searchParams.get("accessToken");

  // Define API URL
  const baseUrl = "https://www.googleapis.com/youtube/v3/channels";
  const apiKey = process.env.YOUTUBE_API_KEY;

  try {
    let response;
    
    // If channelId is missing but we have an accessToken, try to fetch the "mine" channel
    if (!channelId && accessToken) {
      const mineRes = await fetch(`${baseUrl}?part=id,snippet,statistics&mine=true`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json"
        }
      });
      const mineData = await mineRes.json();
      if (mineData.items && mineData.items.length > 0) {
        channelId = mineData.items[0].id;
      } else {
        return NextResponse.json({ error: "No channel found for this account" }, { status: 404 });
      }
    }

    if (!channelId) {
      return NextResponse.json({ error: "No channelId provided or detectable" }, { status: 400 });
    }
    
    if (accessToken) {
      // Use OAuth 2.0 Flow
      response = await fetch(
        `${baseUrl}?part=statistics,snippet&id=${channelId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json"
          }
        }
      );
    } else if (apiKey) {
      // Fallback for current state (Internal Ops)
      response = await fetch(
        `${baseUrl}?part=statistics,snippet&id=${channelId}&key=${apiKey}`
      );
    } else {
      return NextResponse.json({ error: "Unauthorized: Missing OAuth Token or API Key" }, { status: 401 });
    }

    if (response.status === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (response.status === 403) {
      return NextResponse.json({ error: "Quota Exceeded" }, { status: 403 });
    }

    const data = await response.json();

    if (!data.items || !data.items.length) {
      return NextResponse.json({ error: "Channel Not Found (Permissions Mismatch)" }, { status: 404 });
    }

    const channel = data.items[0];
    const stats = channel.statistics;

    return NextResponse.json({
      id: channel.id,
      title: channel.snippet?.title,
      thumbnails: channel.snippet?.thumbnails,
      subscribers: stats.subscriberCount,
      views: stats.viewCount,
      videos: stats.videoCount
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch YouTube stats" }, { status: 500 });
  }
}
