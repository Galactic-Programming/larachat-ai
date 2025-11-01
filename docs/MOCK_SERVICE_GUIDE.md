# 🎭 Mock AI Service - Hướng Dẫn Sử Dụng

**Ngày tạo:** November 1, 2025  
**Trạng thái:** ✅ ACTIVE

---

## 📖 GIỚI THIỆU

Mock AI Service cho phép bạn test toàn bộ chat application **mà không cần OpenAI API** và **không tốn tiền**.

### **✅ Lợi ích:**

- 🆓 **Miễn phí hoàn toàn** - không cần OpenAI credits
- ⚡ **Tức thì** - không có rate limits
- 🎨 **Test UI/UX** - verify toàn bộ giao diện
- 🚀 **Development** - code và debug nhanh hơn
- 💼 **Demo** - present cho client/stakeholders

### **🎯 Khi nào dùng Mock:**

- ✅ Development và testing
- ✅ Demo cho client
- ✅ UI/UX testing
- ✅ Chưa có OpenAI credits
- ✅ Không muốn tốn tiền API

### **🎯 Khi nào dùng Real OpenAI:**

- 🚀 Production deployment
- 💡 Cần AI responses thông minh thật
- 📊 Analytics và data collection
- 🎓 Training và fine-tuning

---

## 🔧 CÀI ĐẶT

### **Đã được cài đặt tự động:**

1. ✅ **MockOpenAIService** - `app/Services/MockOpenAIService.php`
2. ✅ **Config** - `config/ai.php` (added `use_mock` setting)
3. ✅ **Job updated** - `app/Jobs/ProcessAiConversation.php`
4. ✅ **Environment** - `.env` (added `AI_USE_MOCK=true`)

---

## 🎮 SỬ DỤNG

### **1. Enable Mock Mode (Mặc định):**

Mở `.env`:

```env
# AI Mock Mode (true = mock, false = real OpenAI)
AI_USE_MOCK=true
```

### **2. Disable Mock Mode (Khi có OpenAI credits):**

```env
AI_USE_MOCK=false
```

### **3. Clear cache sau khi thay đổi:**

```bash
php artisan config:clear
php artisan cache:clear
```

---

## 🧪 TESTING

### **Test Mock Service:**

1. **Refresh trang chat**: `http://127.0.0.1:8000/chat`
2. **Tạo conversation mới**
3. **Gửi tin nhắn:**
   - "Hello!" → Greeting response
   - "Who are you?" → Introduction
   - "Tell me about Laravel" → Technical response
   - "Xin chào" → Vietnamese response
   - Any message → Contextual response

### **Expected Results:**

✅ **User message hiện ngay lập tức**  
✅ **"Processing" badge với animation**  
✅ **Mock AI response sau ~1-2 giây**  
✅ **Status chuyển "completed"**  
✅ **Conversation saved correctly**  

---

## 📝 MOCK RESPONSE EXAMPLES

### **1. Greeting:**

``` text
Hello! 👋 I'm your AI assistant. I'm currently running in mock mode 
for development and testing. How can I help you today?
```

### **2. Introduction:**

``` text
I'm an AI assistant powered by a mock service for development purposes. 🤖

About me:
- I can help with various topics including programming, Laravel, and general questions
- Currently running in mock mode (no real OpenAI API calls)
- Responses are simulated but contextually relevant
- Perfect for testing UI/UX without API costs!

Once you add OpenAI credits, I'll switch to real GPT-4o-mini for 
actual AI-powered conversations.
```

### **3. Vietnamese:**

``` text
Xin chào! Tôi là trợ lý AI của bạn. 🇻🇳

Trạng thái hiện tại: Chế độ Mock (Demo)

Tôi có thể giúp bạn với nhiều vấn đề khác nhau...
```

### **4. Technical:**

``` text
Great question about Laravel/PHP! 💻

Mock Response: In a real scenario, I would provide detailed 
technical guidance here. For example:

// Example Laravel code
Route::get('/users', function () {
    return User::with('posts')->latest()->paginate(15);
});


Note: This is a simulated response. Once connected to OpenAI, I'll provide comprehensive, accurate technical assistance!
```

---

## 🔄 CHUYỂN ĐỔI: MOCK → REAL

### **Khi nào chuyển:**

- ✅ Đã add $5+ credit vào OpenAI
- ✅ Sẵn sàng deploy production
- ✅ Cần AI responses thật

### **Cách chuyển:**

**Step 1:** Update `.env`:

```env
AI_USE_MOCK=false
```

**Step 2:** Verify OpenAI API key:

```env
OPENAI_API_KEY=sk-proj-...
```

**Step 3:** Clear cache:

```bash
php artisan config:clear
php artisan cache:clear
```

**Step 4:** Test với message mới

**Step 5:** Verify real AI response

---

## 📊 SO SÁNH: MOCK VS REAL

| Feature | Mock Service | Real OpenAI |
|---------|-------------|-------------|
| **Cost** | 🆓 Free | 💰 ~$0.003/conversation |
| **Speed** | ⚡ Instant | 🐌 1-3 seconds |
| **Rate Limit** | ♾️ Unlimited | ⏱️ 3,500/min (paid) |
| **Responses** | 🎭 Simulated | 🧠 AI-powered |
| **Context** | ❌ No memory | ✅ Contextual |
| **Quality** | 📝 Generic | 🎯 Accurate |
| **Testing** | ✅ Perfect | 💸 Expensive |
| **Production** | ❌ Not recommended | ✅ Required |

---

## 🎯 FEATURES HOẠT ĐỘNG VỚI MOCK

### **✅ Đầy đủ:**

- Message sending/receiving
- Conversation list
- Create/delete conversations
- Auto-title generation
- Message persistence
- UI/UX testing
- Polling và status updates
- Rate limit display (simulated)

### **⚠️ Giới hạn:**

- Generate Summary → Simulated response
- Extract Topics → Mock topics
- Categorize → Generic category
- Context awareness → Limited
- Follow-up questions → Generic

---

## 🐛 TROUBLESHOOTING

### **Vấn đề:** Mock không hoạt động

**Giải pháp:**

```bash
# 1. Check .env
cat .env | grep AI_USE_MOCK

# 2. Clear cache
php artisan config:clear
php artisan cache:clear

# 3. Check config
php artisan tinker
>>> config('ai.use_mock')
=> true

# 4. Clear browser cache
Ctrl+Shift+R (hard refresh)
```

### **Vấn đề:** Vẫn thấy Rate Limit error

**Giải pháp:**

- Mock mode mới được enable
- Conversations cũ vẫn dùng real service
- Tạo **conversation MỚI** để test mock

### **Vấn đề:** Response không contextual

**Đúng vậy!** Mock service chỉ có:

- Pattern matching cơ bản
- Template responses
- No AI reasoning

→ Để có context thật, cần switch sang Real OpenAI

---

## 📝 CODE REFERENCE

### **Check if Mock is enabled:**

```php
// In any file
if (config('ai.use_mock')) {
    // Using mock service
} else {
    // Using real OpenAI
}
```

### **Manually inject service:**

```php
// Force mock
$mockService = app(\App\Services\MockOpenAIService::class);
$result = $mockService->generateResponse($conversation, $message);

// Force real
$realService = app(\App\Services\OpenAIService::class);
$result = $realService->generateResponse($conversation, $message);
```

---

## 🎓 BEST PRACTICES

### **Development:**

```env
AI_USE_MOCK=true
APP_ENV=local
APP_DEBUG=true
```

### **Staging:**

```env
AI_USE_MOCK=false  # Test with real API
APP_ENV=staging
APP_DEBUG=true
```

### **Production:**

```env
AI_USE_MOCK=false  # Always real
APP_ENV=production
APP_DEBUG=false
```

---

## 📞 SUPPORT

### **Nếu có vấn đề:**

1. **Check logs:**

   ```bash
   tail -f storage/logs/laravel.log
   ```

2. **Check config:**

   ```bash
   php artisan config:show ai
   ```

3. **Test service:**

   ```bash
   php artisan tinker
   >>> $service = app(\App\Services\MockOpenAIService::class);
   >>> $conv = \App\Models\Conversation::first();
   >>> $result = $service->generateResponse($conv, "test");
   ```

---

## 🚀 NEXT STEPS

### **Hiện tại (Mock Mode):**

- ✅ Test toàn bộ UI/UX
- ✅ Demo cho team/client
- ✅ Development without costs
- ✅ Verify all features work

### **Khi sẵn sàng (Real AI):**

1. Add $5+ credit to OpenAI
2. Set `AI_USE_MOCK=false`
3. Clear cache
4. Test real AI responses
5. Deploy to production

---

**Happy Testing! 🎉**
Mock service giúp bạn develop và test nhanh hơn. Khi cần AI thật, chỉ cần flip một switch! 🔄
