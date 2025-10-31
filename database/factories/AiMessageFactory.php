<?php

namespace Database\Factories;

use App\Models\Conversation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AiMessage>
 */
class AiMessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $content = $this->faker->paragraph();

        return [
            'conversation_id' => Conversation::factory(),
            'role' => $this->faker->randomElement(['user', 'assistant']),
            'content' => $content,
            'token_count' => (int) ceil(strlen($content) / 4), // Rough estimation
        ];
    }

    /**
     * Indicate that the message is from the user.
     */
    public function user(): static
    {
        return $this->state(fn(array $attributes) => [
            'role' => 'user',
        ]);
    }

    /**
     * Indicate that the message is from the assistant.
     */
    public function assistant(): static
    {
        return $this->state(fn(array $attributes) => [
            'role' => 'assistant',
        ]);
    }

    /**
     * Indicate that the message is a system message.
     */
    public function system(): static
    {
        return $this->state(fn(array $attributes) => [
            'role' => 'system',
        ]);
    }
}
