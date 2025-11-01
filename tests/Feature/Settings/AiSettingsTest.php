<?php

use App\Models\User;

it('displays AI settings page for authenticated users', function () {
    /** @var User $user */
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/settings/ai');

    $response->assertOk();
    $response->assertInertia(
        fn ($page) => $page
            ->component('settings/ai-settings')
            ->has('settings')
            ->has('settings.model')
            ->has('settings.temperature')
            ->has('settings.max_tokens')
    );
});

it('redirects guests to login page', function () {
    $response = $this->get('/settings/ai');

    $response->assertRedirect('/login');
});

it('updates AI settings successfully', function () {
    /** @var User $user */
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/settings/ai', [
        'model' => 'llama-3.3-70b-versatile', // Use Groq model
        'temperature' => 0.5,
        'max_tokens' => 2000,
    ]);

    $response->assertRedirect();

    expect(session('ai_model'))->toBe('llama-3.3-70b-versatile');
    expect(session('ai_temperature'))->toBe(0.5);
    expect(session('ai_max_tokens'))->toBe(2000);
});

it('validates AI settings input', function () {
    /** @var User $user */
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/settings/ai', [
        'model' => 'invalid-model',
        'temperature' => 2.0, // Too high
        'max_tokens' => 50, // Too low
    ]);

    $response->assertSessionHasErrors(['model', 'temperature', 'max_tokens']);
});

it('requires temperature between 0 and 1', function () {
    /** @var User $user */
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/settings/ai', [
        'model' => 'llama-3.3-70b-versatile', // Use Groq model
        'temperature' => 1.5,
        'max_tokens' => 1500,
    ]);

    $response->assertSessionHasErrors('temperature');
});

it('requires max_tokens between 100 and 4000', function () {
    /** @var User $user */
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/settings/ai', [
        'model' => 'llama-3.3-70b-versatile', // Use Groq model
        'temperature' => 0.3,
        'max_tokens' => 5000,
    ]);

    $response->assertSessionHasErrors('max_tokens');
});

it('uses default settings when no session values exist', function () {
    /** @var User $user */
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/settings/ai');

    $response->assertInertia(
        fn ($page) => $page
            ->where('settings.model', config('ai.default_model'))
            ->where('settings.temperature', config('ai.temperature.default'))
            ->where('settings.max_tokens', 1500)
    );
});

it('loads saved settings from session', function () {
    /** @var User $user */
    $user = User::factory()->create();

    session([
        'ai_model' => 'llama-3.1-70b-versatile', // Use Groq model
        'ai_temperature' => 0.8,
        'ai_max_tokens' => 3000,
    ]);

    $response = $this->actingAs($user)->get('/settings/ai');

    $response->assertInertia(
        fn ($page) => $page
            ->where('settings.model', 'llama-3.1-70b-versatile')
            ->where('settings.temperature', 0.8)
            ->where('settings.max_tokens', 3000)
    );
});
