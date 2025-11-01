# Code Cleanup Checklist

Based on the full code audit, here's your step-by-step cleanup guide.

---

## ✅ High Priority (Do Now)

### ~~1. Remove Demo Files~~ - **SKIP: Keeping as Examples**

**Decision:** Demo files are kept as reference examples and testing sandbox.

**Files to KEEP:**

- ✅ `resources/js/pages/chat/demo.tsx` - Useful example
- ✅ `resources/js/pages/chat/layout-demo.tsx` - Useful example  
- ✅ Demo routes in `routes/web.php` - No harm keeping them

**Why keeping them:**

- Reference for component usage
- Testing/experimentation sandbox
- Living documentation
- Behind auth, no security issue
- 10KB is minimal overhead

**Action:** No action needed - demos are useful! ✅

---

### 1. Check ModelSelector Usage

**Check if it's used:**

```powershell
# Run the usage checker
.\scripts\check-model-selector-usage.ps1
```

**Or manually:**

```bash
# Search for usage
grep -r "ModelSelector" app/ resources/
```

**If NOT used:**

- [ ] Delete `app/Models/ModelSelector.php`

**If used:**

- [ ] Update `selectModel()` to return Groq models:

```php
public static function selectModel(string $complexity = 'moderate'): string
{
    return match ($complexity) {
        'simple' => 'gemma2-9b-it',              // Fast, lightweight
        'moderate' => 'llama-3.3-70b-versatile', // Recommended
        'complex' => 'llama3-groq-70b-8192-tool-use-preview', // Advanced
        default => config('openai.default_model', 'llama-3.3-70b-versatile'),
    };
}
```

---

### 3. Fix or Remove Test Route

**File:** `routes/web.php` (Lines 33-50)

**Option A: Remove it (if not needed)** 1

```php
// DELETE this entire route:
Route::get('/ai/test', function () { ... });
```

**Option B: Update it to Groq** 2

```php
// UPDATE model to Groq + add auth:
Route::middleware(['auth'])->get('/ai/test', function () {
    try {
        $result = OpenAI::chat()->create([
            'model' => config('openai.default_model', 'llama-3.3-70b-versatile'),
            'messages' => [
                ['role' => 'system', 'content' => 'You are a helpful Laravel assistant.'],
                ['role' => 'user', 'content' => 'Explain Laravel in exactly 3 sentences.'],
            ],
        ]);

        return response()->json([
            'success' => true,
            'response' => $result->choices[0]->message->content,
        ]);
    } catch (\OpenAI\Exceptions\ErrorException $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
        ], 500);
    }
});
```

**Recommendation:** Remove it unless you actively use it for testing.

- [ ] Remove `/ai/test` route (or update it)

---

## ⚠️ Medium Priority (Do This Week)

### 4. Add Documentation to MockOpenAIService

**File:** `app/Services/MockOpenAIService.php`

**Add this comment at the top of the class:**

```php
/**
 * Mock OpenAI Service for development and testing
 * 
 * NOTE: With Groq FREE API, this is mainly useful for:
 * - Offline development (no internet connection)
 * - Unit tests (no external API dependency)
 * - CI/CD pipelines (faster, no rate limits)
 * 
 * For normal development, use Groq API directly (AI_USE_MOCK=false in .env)
 */
class MockOpenAIService
```

- [ ] Add documentation comment to `MockOpenAIService.php`

---

### 5. Consider Removing MockOpenAIService

**Question:** Do you actually use the mock service?

**Check usage:**

```bash
# Search for where it's instantiated
grep -r "MockOpenAIService" app/
```

**If you only use Groq now:**

- [ ] Consider removing `app/Services/MockOpenAIService.php`
- [ ] Remove `AI_USE_MOCK` from `.env` and `config/ai.php`

**If you want to keep it for testing:**

- [ ] Keep it, just add the documentation (step 4)

---

## 🔄 Optional Optimizations (Future)

### 6. Add Pagination (if > 100 conversations)

**File:** `app/Http/Controllers/AiChatController.php`

**Current:**

```php
public function listConversations(): JsonResponse
{
    $conversations = Conversation::with('messages')
        ->where('user_id', Auth::id())
        ->orderBy('updated_at', 'desc')
        ->get();

    return response()->json([
        'success' => true,
        'conversations' => $conversations,
    ]);
}
```

**Optimized (with pagination):**

```php
public function listConversations(): JsonResponse
{
    $conversations = Conversation::withCount('messages') // Don't load all messages
        ->where('user_id', Auth::id())
        ->orderBy('updated_at', 'desc')
        ->paginate(50); // Add pagination

    return response()->json([
        'success' => true,
        'conversations' => $conversations->items(),
        'pagination' => [
            'total' => $conversations->total(),
            'per_page' => $conversations->perPage(),
            'current_page' => $conversations->currentPage(),
            'last_page' => $conversations->lastPage(),
        ],
    ]);
}
```

- [ ] Add pagination to `listConversations()` (when needed)

---

### 7. Add Request Cancellation to Polling

**File:** `resources/js/hooks/use-polling.ts`

**Current:** Polling continues even if component unmounts

**Optimized:**

```typescript
useEffect(() => {
    if (!enabled) {
        stopPolling();
        return;
    }

    const abortController = new AbortController();

    const poll = async () => {
        if (!isPollingRef.current) return;

        try {
            const response = await axios.get<PollConversationResponse>(
                `/api/conversations/${conversationId}/poll`,
                { signal: abortController.signal } // Add cancellation
            );

            if (response.data.success) {
                onUpdate?.(response.data);
            }
        } catch (error) {
            if (!axios.isCancel(error)) {
                console.error('Polling error:', error);
            }
        }

        if (isPollingRef.current) {
            timeoutIdRef.current = window.setTimeout(poll, interval);
        }
    };

    poll();

    return () => {
        abortController.abort(); // Cancel on unmount
        if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
        }
    };
}, [conversationId, enabled, interval, onUpdate]);
```

- [ ] Add request cancellation to `use-polling.ts` (minor optimization)

---

## 🧪 Testing After Cleanup

### Run Tests

```bash
# Backend tests
php artisan test

# Or specific test
php artisan test --filter=AiChatControllerTest
```

### Manual Testing Checklist

- [ ] Can create new conversation
- [ ] Can send messages and receive AI responses
- [ ] Can switch between conversations
- [ ] Can delete conversations
- [ ] Can generate summary
- [ ] Can extract topics
- [ ] Can categorize conversation
- [ ] AI Settings page loads correctly
- [ ] All 5 Groq models selectable
- [ ] No console errors in browser (F12)

### Verify Bundle Size

```bash
# Before cleanup
npm run build
# Note the bundle size

# After cleanup (should be ~10KB smaller)
npm run build
```

---

## 📊 Completion Status

Track your progress:

### High Priority ✅

- [ ] Removed demo files
- [ ] Checked ModelSelector usage
- [ ] Fixed/removed test route
- [ ] Ran tests after cleanup
- [ ] Verified no errors

### Medium Priority ⚠️

- [ ] Documented MockOpenAIService
- [ ] Decided to keep/remove mock service

### Optional 🔄

- [ ] Added pagination (if needed)
- [ ] Added request cancellation (if needed)

---

## 🚀 After Cleanup

Once you've completed the high-priority items:

1. **Rebuild frontend:**

   ```bash
   npm run build
   ```

2. **Clear Laravel caches:**

   ```bash
   php artisan route:cache
   php artisan config:cache
   php artisan view:cache
   ```

3. **Run tests:**

   ```bash
   php artisan test
   ```

4. **Test in browser:**
   - Visit `/chat`
   - Send a message
   - Verify Groq AI responds
   - Check browser console (F12) for errors

5. **Verify auto-title generation:**
   - Create new conversation
   - Send 2 messages
   - Wait for title to update from "New Conversation"

---

## 📚 Related Documentation

- [Code Audit Report](./CODE_AUDIT_REPORT.md) - Full audit findings
- [Groq Integration](./GROQ_INTEGRATION.md) - Groq setup guide
- [Groq Models Update](./GROQ_MODELS_UPDATE.md) - Model migration summary

---

**Last Updated:** November 1, 2025  
**Status:** Ready for cleanup ✅
