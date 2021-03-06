/*global describe:false, before:false, after:false, it:false*/
'use strict';

var assert = require('assert'),
    scm_eval = require('../lib/eval'),
    Env = require('../lib/env'),
    S = require('../lib/S');

describe('Scheme', function () {
  describe('evaluator', function() {
    it('should evaluate self-evaluating value', function () {
      var res, env = Env.setup();
      res = scm_eval('1', env);
      assert.strictEqual(res, 1);

      res = scm_eval('"Hello Scheme"', env);
      assert.strictEqual(res, '"Hello Scheme"');
    });

    it('should evaluate variable', function () {
      var res, env = Env.setup();
      env.defineVar('x', 100);
      res = scm_eval('x', env);
      assert.strictEqual(res, 100);
    });

    it('should evaluate quoted', function () {
      var res, env = Env.setup();
      res = scm_eval("'a", env);
      assert.strictEqual(res, 'a');

      res = scm_eval("(quote b)", env);
      assert.strictEqual(res, 'b');

      res = scm_eval("'(a)", env);
      assert.deepEqual(res, S.create('(a)'));

      res = scm_eval("(quote (b))", env);
      assert.deepEqual(res, S.create('(b)'));

      res = scm_eval("'(a b)", env);
      assert.deepEqual(res, S.create('(a b)'));

      res = scm_eval("(quote (a b))", env);
      assert.deepEqual(res, S.create('(a b)'));
    });

    it('should evaluate definition', function () {
      var env = Env.setup();
      scm_eval('(define x 1)', env);
      assert.strictEqual(env.lookupVar('x'), 1);
    });

    it('should evaluate definition (lambda)', function () {
      var env = Env.setup(), res;
      scm_eval('(define (add a b) (+ a b))', env);
      res = env.lookupVar('add');

      assert.strictEqual(S.car(res), 'procedure');
      assert.deepEqual(S.cadr(res), S.list('a', 'b'));
      assert.deepEqual(S.caaddr(res), S.list('+', 'a', 'b'));
      assert.strictEqual(S.cadddr(res), env);
    });

    it('should evaluate if', function () {
      var res,
          env = Env.setup();
      res = scm_eval('(if #t 100 -1)', env);
      assert.strictEqual(res, 100);

      res = scm_eval('(if #f 100 -1)', env);
      assert.strictEqual(res, -1);

      res = scm_eval('(if #t (if #f 100 101) -1)', env);
      assert.strictEqual(res, 101);

      res = scm_eval('(if #f -1 (if #f 100 101))', env);
      assert.strictEqual(res, 101);
    });

    it('should evaluate only #f as falsy ', function () {
      var res,
          env = Env.setup();

      res = scm_eval('(if 0 1 -1)', env);
      assert.strictEqual(res, 1);

      res = scm_eval('(if #f 1 -1)', env);
      assert.strictEqual(res, -1);
    });


    it('should evaluate begin', function () {
      var res,
          env = Env.setup();
      res = scm_eval('(begin (define x 1) (set! x 10) x)', env);
      assert.strictEqual(res, 10);
    });

    it('should evaluate cond', function () {
      var res,
          env = Env.setup();
      res = scm_eval('(cond (#f 1) (#t 2) (else 3))', env);
      assert.strictEqual(res, 2);
    });

    it('should evaluate primitive procedure', function () {
      var res,
          env = Env.setup();
      env.defineVar('x', 1);
      res = scm_eval('(+ x 2 3)', env);
      assert.strictEqual(res, 6);

      res = scm_eval('(= x 1)', env);
      assert.strictEqual(res, true);
    });

    it('should evaluate compound procedure', function () {
      var res,
          env = Env.setup();

      scm_eval('(define (myadd a b) (+ a b))', env);
      res = scm_eval('(myadd 1 2)', env);
      assert.strictEqual(res, 3);

      scm_eval('(define (factorial n) (if (= n 1) 1 (* n (factorial (- n 1)))))', env);
      res = scm_eval('(factorial 3)', env);
      assert.strictEqual(res, 6);

      res = scm_eval('((lambda (x) (+ x 1)) 10)', env);
      assert.strictEqual(res, 11);

      res = scm_eval('((lambda (x) (+ x 1)) 10)', env);
      assert.strictEqual(res, 11);

      res = scm_eval('((lambda (a) a) 1)', env);
      assert.strictEqual(res, 1);
    });

    it('should evaluate `and` expression', function () {
      var res,
          env = Env.setup();

      res = scm_eval('(and 1 1)', env);
      assert.strictEqual(res, 1);

      res = scm_eval('(and 1 0)', env);
      assert.strictEqual(res, 0);

      res = scm_eval('(and 1 #f 2)', env);
      assert.strictEqual(res, false);

      res = scm_eval('(and 1 (< 1 2))', env);
      assert.strictEqual(res, true);

      res = scm_eval('(and 1 (< 1 2) 3)', env);
      assert.strictEqual(res, 3);
    });

    it('should evaluate `and` and `or` lazily', function () {
      var res,
          env = Env.setup();

      env.defineVar('x', 1);
      res = scm_eval('(and 1 (< 2 1) (set! x 2))', env);
      assert.strictEqual(res, false);
      res = scm_eval('x', env);
      assert.strictEqual(res, 1);
    });

    it('should evaluate `let`', function () {
      var res,
          env = Env.setup();

      env.defineVar('x', 1);

      res = scm_eval('(let ((a 1)) a)', env);
      assert.strictEqual(res, 1);

      res = scm_eval('(let ((a x) (b 2)) (+ a b))', env);
      assert.strictEqual(res, 3);
    });
  });

});