import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const channelId = searchParams.get("channelId");

  if (!channelId) {
    return NextResponse.json({ error: "No channelId provided" }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Missing YOUTUBE_API_KEY" }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`
    );

    const data = await response.json();

    if (!data.items || !data.items.length) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const stats = data.items[0].statistics;

    return NextResponse.json({
      subscribers: stats.subscriberCount,
      views: stats.viewCount,
      videos: stats.videoCount
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch YouTube stats" }, { status: 500 });
  }
}
