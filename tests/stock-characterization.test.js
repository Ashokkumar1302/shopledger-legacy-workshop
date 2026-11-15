var test = require('node:test');
var assert = require('node:assert/strict');
var inventory = require('../lib/inventory');
var orders = require('../lib/orders');

function fixture() {
  return {
    products: [{ id: 1, name: 'Rice', stock: 10, reserved: 2 }],
    customers: [],
    orders: []
  };
}

test('inventory check accepts selling exactly the remaining sellable quantity', function () {
  var db = fixture();
  var items = [{ id: 1, qty: 8 }];

  assert.equal(inventory.getSellableStock(db.products[0]), 8);
  assert.equal(inventory.check(db.products, items).ok, true);

  inventory.reserve(db.products, items);
  assert.equal(db.products[0].stock, 2);
  assert.equal(inventory.getSellableStock(db.products[0]), 0);
});

test('cancellation restores checkout stock without changing wholesale reservations', function () {
  var db = fixture();
  var items = [{ id: 1, qty: 3 }];

  inventory.reserve(db.products, items);
  db.orders.push({ id: 1001, status: 'completed', items: items,
    paymentMode: 'cash', total: 50 });

  assert.equal(db.products[0].stock, 7);
  assert.equal(orders.cancel(db, 1001).ok, true);
  assert.equal(db.products[0].stock, 10);
  assert.equal(db.products[0].reserved, 2);
});
