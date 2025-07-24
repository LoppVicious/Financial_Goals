/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('users', table => {
    table.increments('id').primary();
    table.string('email', 255).notNullable().unique();
    table.text('password_hash').notNullable();
    table.string('name', 100);
    table.string('role', 20).notNullable().defaultTo('retail');
    table.boolean('gdpr_consent').notNullable();
    table.boolean('deletion_requested').notNullable().defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('users');
};
