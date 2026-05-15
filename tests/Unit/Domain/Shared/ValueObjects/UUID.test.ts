import { assertEquals, assertThrows, assertInstanceOf } from "@std/assert";
import { IllegalArgumentException } from "@domaincrafters/std";
import { UUID } from '@/Domain/Shared/mod.ts';

Deno.test("[Unit] UUID.create - should generate a valid v4 UUID", () => {
    const uuid = UUID.create();
    
    assertInstanceOf(uuid, UUID as any);
    // Standard UUID regex
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    assertEquals(uuidRegex.test(uuid.value), true, "Generated UUID should match v4 format");
});

Deno.test("[Unit] UUID.parse - should successfully parse valid UUID strings (version agnostic)", async (t) => {
    await t.step("parse v4 UUID", () => {
        const v4Str = "3d6f0a3b-7b9c-4d2a-9f3c-1e2d3c4b5a6f";
        const uuid = UUID.parse(v4Str);
        assertEquals(uuid.value, v4Str);
    });

    await t.step("parse v1 UUID", () => {
        const v1Str = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
        const uuid = UUID.parse(v1Str);
        assertEquals(uuid.value, v1Str);
    });

    await t.step("parse v5 UUID", () => {
        const v5Str = "886313e1-3b8a-5372-9b90-0c9aee199e5d";
        const uuid = UUID.parse(v5Str);
        assertEquals(uuid.value, v5Str);
    });
});

Deno.test("[Unit] UUID.parse - should throw IllegalArgumentException for invalid strings", () => {
    const invalidStrings = [
        "not-a-uuid",
        "3d6f0a3b-7b9c-4d2a-9f3c", // too short
        "z36f0a3b-7b9c-4d2a-9f3c-1e2d3c4b5a6f", // invalid char 'z'
        "",
    ];

    for (const str of invalidStrings) {
        assertThrows(
            () => UUID.parse(str),
            IllegalArgumentException,
            "Invalid UUID"
        );
    }
});

Deno.test("[Unit] UUID.EMPTY - should return the standard zeroed UUID", () => {
    const empty = UUID.EMPTY;
    assertEquals(empty.value, "00000000-0000-0000-0000-000000000000");
});

Deno.test("[Unit] UUID.equals - should compare correctly with UUID instances and strings", async (t) => {
    const raw = "550e8400-e29b-41d4-a716-446655440000";
    const uuid1 = UUID.parse(raw);
    const uuid2 = UUID.parse(raw);
    const uuid3 = UUID.create();

    await t.step("equality with another UUID instance", () => {
        assertEquals(uuid1.equals(uuid2), true);
        assertEquals(uuid1.equals(uuid3), false);
    });

    await t.step("equality with a string", () => {
        assertEquals(uuid1.equals(raw), true);
        assertEquals(uuid1.equals("different-string"), false);
    });

    await t.step("case-insensitivity check", () => {
        const upper = raw.toUpperCase();
        assertEquals(uuid1.equals(upper), true);
    });
});

Deno.test("[Unit] UUID.toString - should return the inner value", () => {
    const uuid = UUID.create();
    assertEquals(uuid.toString(), uuid.value);
    assertEquals(typeof uuid.toString(), "string");
});