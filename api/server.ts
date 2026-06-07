import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { TwitterApi } from "twitter-api-v2";

// 1. ربط مكتبة تويتر بمتغيرات البيئة (التي تقرأ تلقائياً من إعدادات Vercel بأمان)
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY || '',
  appSecret: process.env.TWITTER_API_SECRET || '',
  accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
  accessSecret: process.env.TWITTER_ACCESS_SECRET || '',
});

// إعطاء صلاحيات القراءة والكتابة للحساب
const rwClient = twitterClient.readWrite;

// 2. إنشاء معالج الـ MCP وتثبيت أداة تويتر
const handler = createMcpHandler((server) => {
  server.tool(
    "create-tweet",
    "نشر تغريدة أو بوست جديد على حساب تويتر (X) الخاص بك",
    { 
      text: z.string().min(1).max(280).describe("نص التغريدة المراد نشرها") 
    },
    async ({ text }) => {
      try {
        // إرسال التغريدة عبر الـ API الرسمي لـ X
        const tweet = await rwClient.v2.tweet(text);
        return {
          content: [
            { 
              type: "text", 
              text: `🎉 تم نشر التغريدة بنجاح على حسابك! رقم التغريدة المرجعي: ${tweet.data.id}` 
            }
          ],
        };
      } catch (error) {
        return {
          content: [
            { 
              type: "text", 
              text: `❌ فشل النشر. تأكد من صحة المفاتيح في إعدادات Vercel وصلاحيات التطبيق في تويتر (يجب أن تكون Read and Write). تفاصيل الخطأ: ${error.message}` 
            }
          ],
        };
      }
    },
  );
});

// 3. تصدير الطرق لـ Vercel لكي يتعرف عليها Lovable
export { handler as GET, handler as POST, handler as DELETE };
