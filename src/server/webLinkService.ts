export interface ExtractedLinkData {
  url: string;
  type: 'youtube' | 'web';
  domain: string;
  title: string;
  authorOrChannel?: string;
  thumbnail?: string;
  videoId?: string;
  summaryOrContent: string;
}

// Regex for detecting URLs in text
const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

// SSRF Defense: reject private, loopback, or metadata addresses
function isSafeUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      host.startsWith('172.16.') ||
      host === '169.254.169.254'
    ) {
      return false;
    }
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com')) {
      return parsed.searchParams.get('v') || (parsed.pathname.startsWith('/shorts/') ? parsed.pathname.split('/')[2] : null);
    }
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1).split('?')[0];
    }
  } catch {
    // Ignore
  }
  return null;
}

export async function processLinksInMessage(message: string): Promise<ExtractedLinkData | null> {
  const matches = message.match(URL_REGEX);
  if (!matches || matches.length === 0) return null;

  const rawUrl = matches[0].replace(/[.,;:!?)]+$/, ''); // clean trailing punctuation
  if (!isSafeUrl(rawUrl)) return null;

  const urlObj = new URL(rawUrl);
  const domain = urlObj.hostname.replace('www.', '');

  // 1. YouTube link handling
  const ytId = extractYouTubeVideoId(rawUrl);
  if (ytId) {
    try {
      // Fetch official oEmbed metadata from YouTube
      const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ytId}&format=json`, {
        signal: AbortSignal.timeout(3000),
      });

      let title = `Educational Video Tutorial (YouTube)`;
      let channel = 'Educational Creator';

      if (oembedRes.ok) {
        const data = await oembedRes.json() as any;
        title = data.title || title;
        channel = data.author_name || channel;
      }

      return {
        url: rawUrl,
        type: 'youtube',
        domain: 'youtube.com',
        title,
        authorOrChannel: channel,
        videoId: ytId,
        thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
        summaryOrContent: `This is an educational video from channel "${channel}" titled "${title}". The student is asking for an easy explanation, key takeaways, and summary of the concepts covered in this video.`,
      };
    } catch {
      return {
        url: rawUrl,
        type: 'youtube',
        domain: 'youtube.com',
        title: 'Educational Video Tutorial',
        videoId: ytId,
        thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
        summaryOrContent: `YouTube video tutorial regarding academic study material. Provide a step-by-step easy explanation of the topic requested by the student.`,
      };
    }
  }

  // 2. Web article / GeeksforGeeks / Wikipedia / Educational portal handling
  try {
    const response = await fetch(rawUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(4000),
    });

    if (!response.ok) {
      return {
        url: rawUrl,
        type: 'web',
        domain,
        title: `Study Resource (${domain})`,
        summaryOrContent: `Educational resource from ${domain}. The student wants an easy conceptual breakdown of this topic.`,
      };
    }

    const html = await response.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    let title = titleMatch ? titleMatch[1].trim() : `Tutorial on ${domain}`;
    title = title.replace(/\s*[-|–]\s*(GeeksforGeeks|Wikipedia|Khan Academy).*$/i, '').trim();

    // Extract meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    const metaDesc = descMatch ? descMatch[1].trim() : '';

    // Extract main text (strip scripts, styles, html tags)
    const cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const snippet = cleanText.substring(0, 1500);

    return {
      url: rawUrl,
      type: 'web',
      domain,
      title: title || `Study Page on ${domain}`,
      summaryOrContent: metaDesc ? `${metaDesc}\n\nKey Excerpt: ${snippet}` : snippet || `Educational tutorial from ${domain}.`,
    };
  } catch (e) {
    // Graceful fallback for sites with anti-scraping
    const pathSlug = urlObj.pathname.split('/').filter(Boolean).pop()?.replace(/[-_]/g, ' ') || 'Topic Tutorial';
    return {
      url: rawUrl,
      type: 'web',
      domain,
      title: `${pathSlug.toUpperCase()} (${domain})`,
      summaryOrContent: `Educational resource on ${pathSlug} from ${domain}. Explain the core concepts, syntax, formulas, and examples clearly for the student.`,
    };
  }
}
