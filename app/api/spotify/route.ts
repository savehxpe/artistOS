import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const artistUrl = searchParams.get("artistUrl") || searchParams.get("artistId");

  if (!artistUrl) {
    return NextResponse.json({ error: "No artist URL or ID provided" }, { status: 400 });
  }

  // Extract ID from URL if necessary
  let artistId = artistUrl;
  if (artistUrl.includes("spotify.com/artist/")) {
    const parts = artistUrl.split("artist/");
    if (parts.length > 1) {
      artistId = parts[1].split("?")[0];
    }
  } else if (artistUrl.includes(":artist:")) {
    const parts = artistUrl.split(":");
    artistId = parts[parts.length - 1];
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Missing SPOTIFY credentials" }, { status: 500 });
  }

  try {
    // 1. Get access token
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
      },
      body: "grant_type=client_credentials",
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      return NextResponse.json({ error: tokenData.error || "Failed to get token" }, { status: tokenResponse.status });
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch artist data
    const artistResponse = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const artistData = await artistResponse.json();

    if (!artistResponse.ok) {
      return NextResponse.json({ error: artistData.error?.message || "Artist not found" }, { status: artistResponse.status });
    }

    return NextResponse.json({
      followers: artistData.followers,
      popularity: artistData.popularity,
      name: artistData.name,
      images: artistData.images,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch Spotify stats" }, { status: 500 });
  }
}
