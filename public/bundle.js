
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity$1 = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_custom_element_data(node, prop, value) {
        if (prop in node) {
            node[prop] = typeof node[prop] === 'boolean' && value === '' ? true : value;
        }
        else {
            attr(node, prop, value);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity$1, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/multimedia/Video.svelte generated by Svelte v3.38.2 */

    const file$i = "src/components/multimedia/Video.svelte";

    // (30:0) {:else}
    function create_else_block$5(ctx) {
    	let video;
    	let track;
    	let video_src_value;
    	let video_updating = false;
    	let video_animationframe;
    	let mounted;
    	let dispose;

    	function video_timeupdate_handler_1() {
    		cancelAnimationFrame(video_animationframe);

    		if (!video.paused) {
    			video_animationframe = raf(video_timeupdate_handler_1);
    			video_updating = true;
    		}

    		/*video_timeupdate_handler_1*/ ctx[11].call(video);
    	}

    	const block = {
    		c: function create() {
    			video = element("video");
    			track = element("track");
    			attr_dev(track, "kind", "captions");
    			add_location(track, file$i, 41, 2, 767);
    			attr_dev(video, "preload", "auto");
    			attr_dev(video, "class", /*layout*/ ctx[4]);
    			attr_dev(video, "poster", /*poster*/ ctx[2]);

    			if (video.src !== (video_src_value = "" + ((/*desktop*/ ctx[7]
    			? `${/*src*/ ctx[3]}`
    			: `${/*src*/ ctx[3]}-mobile`) + ".mp4"))) attr_dev(video, "src", video_src_value);

    			video.muted = true;
    			video.autoplay = /*noscroll*/ ctx[5];
    			video.playsInline = "true";
    			video.loop = /*noscroll*/ ctx[5];
    			if (/*duration*/ ctx[1] === void 0) add_render_callback(() => /*video_durationchange_handler_1*/ ctx[12].call(video));
    			add_location(video, file$i, 30, 0, 533);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, video, anchor);
    			append_dev(video, track);

    			if (!mounted) {
    				dispose = [
    					listen_dev(video, "timeupdate", video_timeupdate_handler_1),
    					listen_dev(video, "durationchange", /*video_durationchange_handler_1*/ ctx[12])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*layout*/ 16) {
    				attr_dev(video, "class", /*layout*/ ctx[4]);
    			}

    			if (dirty & /*poster*/ 4) {
    				attr_dev(video, "poster", /*poster*/ ctx[2]);
    			}

    			if (dirty & /*desktop, src*/ 136 && video.src !== (video_src_value = "" + ((/*desktop*/ ctx[7]
    			? `${/*src*/ ctx[3]}`
    			: `${/*src*/ ctx[3]}-mobile`) + ".mp4"))) {
    				attr_dev(video, "src", video_src_value);
    			}

    			if (dirty & /*noscroll*/ 32) {
    				prop_dev(video, "autoplay", /*noscroll*/ ctx[5]);
    			}

    			if (dirty & /*noscroll*/ 32) {
    				prop_dev(video, "loop", /*noscroll*/ ctx[5]);
    			}

    			if (!video_updating && dirty & /*time*/ 1 && !isNaN(/*time*/ ctx[0])) {
    				video.currentTime = /*time*/ ctx[0];
    			}

    			video_updating = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(video);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(30:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (16:0) {#if noscroll}
    function create_if_block$b(ctx) {
    	let video;
    	let track;
    	let video_src_value;
    	let video_updating = false;
    	let video_animationframe;
    	let mounted;
    	let dispose;

    	function video_timeupdate_handler() {
    		cancelAnimationFrame(video_animationframe);

    		if (!video.paused) {
    			video_animationframe = raf(video_timeupdate_handler);
    			video_updating = true;
    		}

    		/*video_timeupdate_handler*/ ctx[9].call(video);
    	}

    	const block = {
    		c: function create() {
    			video = element("video");
    			track = element("track");
    			attr_dev(track, "kind", "captions");
    			add_location(track, file$i, 27, 2, 492);
    			attr_dev(video, "preload", "metadata");
    			attr_dev(video, "class", /*layout*/ ctx[4]);
    			attr_dev(video, "poster", /*poster*/ ctx[2]);

    			if (video.src !== (video_src_value = "" + ((/*desktop*/ ctx[7]
    			? `${/*src*/ ctx[3]}`
    			: `${/*src*/ ctx[3]}-mobile`) + ".mp4"))) attr_dev(video, "src", video_src_value);

    			video.muted = true;
    			video.autoplay = /*noscroll*/ ctx[5];
    			video.playsInline = "true";
    			video.loop = /*noscroll*/ ctx[5];
    			if (/*duration*/ ctx[1] === void 0) add_render_callback(() => /*video_durationchange_handler*/ ctx[10].call(video));
    			add_location(video, file$i, 16, 0, 256);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, video, anchor);
    			append_dev(video, track);

    			if (!mounted) {
    				dispose = [
    					listen_dev(video, "timeupdate", video_timeupdate_handler),
    					listen_dev(video, "durationchange", /*video_durationchange_handler*/ ctx[10])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*layout*/ 16) {
    				attr_dev(video, "class", /*layout*/ ctx[4]);
    			}

    			if (dirty & /*poster*/ 4) {
    				attr_dev(video, "poster", /*poster*/ ctx[2]);
    			}

    			if (dirty & /*desktop, src*/ 136 && video.src !== (video_src_value = "" + ((/*desktop*/ ctx[7]
    			? `${/*src*/ ctx[3]}`
    			: `${/*src*/ ctx[3]}-mobile`) + ".mp4"))) {
    				attr_dev(video, "src", video_src_value);
    			}

    			if (dirty & /*noscroll*/ 32) {
    				prop_dev(video, "autoplay", /*noscroll*/ ctx[5]);
    			}

    			if (dirty & /*noscroll*/ 32) {
    				prop_dev(video, "loop", /*noscroll*/ ctx[5]);
    			}

    			if (!video_updating && dirty & /*time*/ 1 && !isNaN(/*time*/ ctx[0])) {
    				video.currentTime = /*time*/ ctx[0];
    			}

    			video_updating = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(video);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(16:0) {#if noscroll}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let if_block_anchor;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[8]);

    	function select_block_type(ctx, dirty) {
    		if (/*noscroll*/ ctx[5]) return create_if_block$b;
    		return create_else_block$5;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);

    			if (!mounted) {
    				dispose = listen_dev(window, "resize", /*onwindowresize*/ ctx[8]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let desktop;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Video", slots, []);
    	let { poster } = $$props;
    	let { src } = $$props;
    	let { layout } = $$props;
    	let { time } = $$props;
    	let { duration } = $$props;
    	let { noscroll = true } = $$props;
    	let width;
    	const writable_props = ["poster", "src", "layout", "time", "duration", "noscroll"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Video> was created with unknown prop '${key}'`);
    	});

    	function onwindowresize() {
    		$$invalidate(6, width = window.innerWidth);
    	}

    	function video_timeupdate_handler() {
    		time = this.currentTime;
    		$$invalidate(0, time);
    	}

    	function video_durationchange_handler() {
    		duration = this.duration;
    		$$invalidate(1, duration);
    	}

    	function video_timeupdate_handler_1() {
    		time = this.currentTime;
    		$$invalidate(0, time);
    	}

    	function video_durationchange_handler_1() {
    		duration = this.duration;
    		$$invalidate(1, duration);
    	}

    	$$self.$$set = $$props => {
    		if ("poster" in $$props) $$invalidate(2, poster = $$props.poster);
    		if ("src" in $$props) $$invalidate(3, src = $$props.src);
    		if ("layout" in $$props) $$invalidate(4, layout = $$props.layout);
    		if ("time" in $$props) $$invalidate(0, time = $$props.time);
    		if ("duration" in $$props) $$invalidate(1, duration = $$props.duration);
    		if ("noscroll" in $$props) $$invalidate(5, noscroll = $$props.noscroll);
    	};

    	$$self.$capture_state = () => ({
    		poster,
    		src,
    		layout,
    		time,
    		duration,
    		noscroll,
    		width,
    		desktop
    	});

    	$$self.$inject_state = $$props => {
    		if ("poster" in $$props) $$invalidate(2, poster = $$props.poster);
    		if ("src" in $$props) $$invalidate(3, src = $$props.src);
    		if ("layout" in $$props) $$invalidate(4, layout = $$props.layout);
    		if ("time" in $$props) $$invalidate(0, time = $$props.time);
    		if ("duration" in $$props) $$invalidate(1, duration = $$props.duration);
    		if ("noscroll" in $$props) $$invalidate(5, noscroll = $$props.noscroll);
    		if ("width" in $$props) $$invalidate(6, width = $$props.width);
    		if ("desktop" in $$props) $$invalidate(7, desktop = $$props.desktop);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*width*/ 64) {
    			$$invalidate(7, desktop = width > 1008);
    		}
    	};

    	return [
    		time,
    		duration,
    		poster,
    		src,
    		layout,
    		noscroll,
    		width,
    		desktop,
    		onwindowresize,
    		video_timeupdate_handler,
    		video_durationchange_handler,
    		video_timeupdate_handler_1,
    		video_durationchange_handler_1
    	];
    }

    class Video extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {
    			poster: 2,
    			src: 3,
    			layout: 4,
    			time: 0,
    			duration: 1,
    			noscroll: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Video",
    			options,
    			id: create_fragment$j.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*poster*/ ctx[2] === undefined && !("poster" in props)) {
    			console.warn("<Video> was created without expected prop 'poster'");
    		}

    		if (/*src*/ ctx[3] === undefined && !("src" in props)) {
    			console.warn("<Video> was created without expected prop 'src'");
    		}

    		if (/*layout*/ ctx[4] === undefined && !("layout" in props)) {
    			console.warn("<Video> was created without expected prop 'layout'");
    		}

    		if (/*time*/ ctx[0] === undefined && !("time" in props)) {
    			console.warn("<Video> was created without expected prop 'time'");
    		}

    		if (/*duration*/ ctx[1] === undefined && !("duration" in props)) {
    			console.warn("<Video> was created without expected prop 'duration'");
    		}
    	}

    	get poster() {
    		throw new Error("<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set poster(value) {
    		throw new Error("<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get src() {
    		throw new Error("<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get layout() {
    		throw new Error("<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set layout(value) {
    		throw new Error("<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get time() {
    		throw new Error("<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set time(value) {
    		throw new Error("<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duration() {
    		throw new Error("<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noscroll() {
    		throw new Error("<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noscroll(value) {
    		throw new Error("<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-intersection-observer/src/IntersectionObserver.svelte generated by Svelte v3.38.2 */

    const get_default_slot_changes = dirty => ({
    	intersecting: dirty & /*intersecting*/ 2,
    	entry: dirty & /*entry*/ 1,
    	observer: dirty & /*observer*/ 4
    });

    const get_default_slot_context = ctx => ({
    	intersecting: /*intersecting*/ ctx[1],
    	entry: /*entry*/ ctx[0],
    	observer: /*observer*/ ctx[2]
    });

    function create_fragment$i(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, intersecting, entry, observer*/ 263)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("IntersectionObserver", slots, ['default']);
    	let { element = null } = $$props;
    	let { once = false } = $$props;
    	let { root = null } = $$props;
    	let { rootMargin = "0px" } = $$props;
    	let { threshold = 0 } = $$props;
    	let { entry = null } = $$props;
    	let { intersecting = false } = $$props;
    	let { observer = null } = $$props;
    	const dispatch = createEventDispatcher();
    	let prevElement = null;

    	afterUpdate(async () => {
    		if (entry !== null) {
    			dispatch("observe", entry);

    			if (entry.isIntersecting) {
    				dispatch("intersect", entry);
    				if (once) observer.unobserve(entry.target);
    			}
    		}

    		await tick();

    		if (element !== null && element !== prevElement) {
    			observer.observe(element);
    			if (prevElement !== null) observer.unobserve(prevElement);
    			prevElement = element;
    		}
    	});

    	onMount(() => {
    		$$invalidate(2, observer = new IntersectionObserver(entries => {
    				entries.forEach(_entry => {
    					$$invalidate(0, entry = _entry);
    					$$invalidate(1, intersecting = _entry.isIntersecting);
    				});
    			},
    		{ root, rootMargin, threshold }));

    		return () => {
    			if (observer) observer.disconnect();
    		};
    	});

    	const writable_props = [
    		"element",
    		"once",
    		"root",
    		"rootMargin",
    		"threshold",
    		"entry",
    		"intersecting",
    		"observer"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<IntersectionObserver> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("element" in $$props) $$invalidate(3, element = $$props.element);
    		if ("once" in $$props) $$invalidate(4, once = $$props.once);
    		if ("root" in $$props) $$invalidate(5, root = $$props.root);
    		if ("rootMargin" in $$props) $$invalidate(6, rootMargin = $$props.rootMargin);
    		if ("threshold" in $$props) $$invalidate(7, threshold = $$props.threshold);
    		if ("entry" in $$props) $$invalidate(0, entry = $$props.entry);
    		if ("intersecting" in $$props) $$invalidate(1, intersecting = $$props.intersecting);
    		if ("observer" in $$props) $$invalidate(2, observer = $$props.observer);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		element,
    		once,
    		root,
    		rootMargin,
    		threshold,
    		entry,
    		intersecting,
    		observer,
    		tick,
    		createEventDispatcher,
    		afterUpdate,
    		onMount,
    		dispatch,
    		prevElement
    	});

    	$$self.$inject_state = $$props => {
    		if ("element" in $$props) $$invalidate(3, element = $$props.element);
    		if ("once" in $$props) $$invalidate(4, once = $$props.once);
    		if ("root" in $$props) $$invalidate(5, root = $$props.root);
    		if ("rootMargin" in $$props) $$invalidate(6, rootMargin = $$props.rootMargin);
    		if ("threshold" in $$props) $$invalidate(7, threshold = $$props.threshold);
    		if ("entry" in $$props) $$invalidate(0, entry = $$props.entry);
    		if ("intersecting" in $$props) $$invalidate(1, intersecting = $$props.intersecting);
    		if ("observer" in $$props) $$invalidate(2, observer = $$props.observer);
    		if ("prevElement" in $$props) prevElement = $$props.prevElement;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		entry,
    		intersecting,
    		observer,
    		element,
    		once,
    		root,
    		rootMargin,
    		threshold,
    		$$scope,
    		slots
    	];
    }

    class IntersectionObserver_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {
    			element: 3,
    			once: 4,
    			root: 5,
    			rootMargin: 6,
    			threshold: 7,
    			entry: 0,
    			intersecting: 1,
    			observer: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IntersectionObserver_1",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get element() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set element(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get once() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set once(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get root() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set root(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rootMargin() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rootMargin(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get threshold() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set threshold(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get entry() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set entry(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get intersecting() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set intersecting(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get observer() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set observer(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity$1 } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src/components/text/Intro.svelte generated by Svelte v3.38.2 */

    const { window: window_1$2 } = globals;
    const file$h = "src/components/text/Intro.svelte";

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    function get_each_context$a(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    // (25:1) <IntersectionObserver {element} bind:intersecting threshold=1 rootMargin='100%'>
    function create_default_slot$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "pill-location svelte-183g6r3");
    			add_location(div, file$h, 25, 2, 548);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[12](div);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[12](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(25:1) <IntersectionObserver {element} bind:intersecting threshold=1 rootMargin='100%'>",
    		ctx
    	});

    	return block;
    }

    // (28:1) {#if intersecting}
    function create_if_block$a(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$6, create_else_block$4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*mobile*/ ctx[9]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(28:1) {#if intersecting}",
    		ctx
    	});

    	return block;
    }

    // (45:2) {:else}
    function create_else_block$4(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let video;
    	let t0;
    	let p0;
    	let t1;
    	let p1;
    	let t2;
    	let ul;
    	let div2_resize_listener;
    	let div2_transition;
    	let current;

    	video = new Video({
    			props: {
    				src: "video/header",
    				poster: "",
    				layout: "third"
    			},
    			$$inline: true
    		});

    	let each_value_1 = /*stories*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			create_component(video.$$.fragment);
    			t0 = space();
    			p0 = element("p");
    			t1 = space();
    			p1 = element("p");
    			t2 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(p0, "class", "tag svelte-183g6r3");
    			add_location(p0, file$h, 53, 5, 1466);
    			attr_dev(p1, "class", "header svelte-183g6r3");
    			add_location(p1, file$h, 54, 5, 1502);
    			attr_dev(ul, "class", "svelte-183g6r3");
    			add_location(ul, file$h, 55, 5, 1544);
    			attr_dev(div0, "class", "pill-content-wrapper");
    			add_location(div0, file$h, 47, 4, 1344);
    			attr_dev(div1, "class", "pill svelte-183g6r3");
    			add_location(div1, file$h, 46, 3, 1321);
    			attr_dev(div2, "class", "pill-wrapper svelte-183g6r3");
    			add_render_callback(() => /*div2_elementresize_handler_1*/ ctx[15].call(div2));
    			add_location(div2, file$h, 45, 2, 1219);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			mount_component(video, div0, null);
    			append_dev(div0, t0);
    			append_dev(div0, p0);
    			p0.innerHTML = /*tag*/ ctx[0];
    			append_dev(div0, t1);
    			append_dev(div0, p1);
    			p1.innerHTML = /*kicker*/ ctx[1];
    			append_dev(div0, t2);
    			append_dev(div0, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			div2_resize_listener = add_resize_listener(div2, /*div2_elementresize_handler_1*/ ctx[15].bind(div2));
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (!current || dirty & /*tag*/ 1) p0.innerHTML = /*tag*/ ctx[0];			if (!current || dirty & /*kicker*/ 2) p1.innerHTML = /*kicker*/ ctx[1];
    			if (dirty & /*stories, lang*/ 12) {
    				each_value_1 = /*stories*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(video.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fly, { x: /*width*/ ctx[7], duration: 600 }, true);
    				div2_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(video.$$.fragment, local);
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fly, { x: /*width*/ ctx[7], duration: 600 }, false);
    			div2_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(video);
    			destroy_each(each_blocks, detaching);
    			div2_resize_listener();
    			if (detaching && div2_transition) div2_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(45:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (29:2) {#if mobile}
    function create_if_block_1$6(ctx) {
    	let div2;
    	let div1;
    	let p;
    	let t0;
    	let t1;
    	let div0;
    	let div0_class_value;
    	let div1_class_value;
    	let div2_resize_listener;
    	let div2_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*opened*/ ctx[8] && create_if_block_2$4(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			p = element("p");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			div0 = element("div");
    			attr_dev(p, "class", "svelte-183g6r3");
    			add_location(p, file$h, 31, 4, 848);
    			attr_dev(div0, "class", div0_class_value = "icon " + (/*opened*/ ctx[8] ? "opened" : "closed") + " svelte-183g6r3");
    			add_location(div0, file$h, 41, 4, 1132);
    			attr_dev(div1, "class", div1_class_value = "pill " + (/*opened*/ ctx[8] ? "pill--opened" : "pill--closed") + " svelte-183g6r3");
    			add_location(div1, file$h, 30, 3, 766);
    			attr_dev(div2, "class", "pill-wrapper svelte-183g6r3");
    			add_render_callback(() => /*div2_elementresize_handler*/ ctx[14].call(div2));
    			add_location(div2, file$h, 29, 2, 664);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, p);
    			p.innerHTML = /*kicker*/ ctx[1];
    			append_dev(div1, t0);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			div2_resize_listener = add_resize_listener(div2, /*div2_elementresize_handler*/ ctx[14].bind(div2));
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", /*open*/ ctx[10], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (!current || dirty & /*kicker*/ 2) p.innerHTML = /*kicker*/ ctx[1];
    			if (/*opened*/ ctx[8]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*opened*/ 256) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, t1);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*opened*/ 256 && div0_class_value !== (div0_class_value = "icon " + (/*opened*/ ctx[8] ? "opened" : "closed") + " svelte-183g6r3")) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (!current || dirty & /*opened*/ 256 && div1_class_value !== (div1_class_value = "pill " + (/*opened*/ ctx[8] ? "pill--opened" : "pill--closed") + " svelte-183g6r3")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fly, { x: /*width*/ ctx[7], duration: 600 }, true);
    				div2_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fly, { x: /*width*/ ctx[7], duration: 600 }, false);
    			div2_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    			div2_resize_listener();
    			if (detaching && div2_transition) div2_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(29:2) {#if mobile}",
    		ctx
    	});

    	return block;
    }

    // (57:6) {#each stories as story}
    function create_each_block_1$2(ctx) {
    	let li;
    	let a;
    	let t_value = /*story*/ ctx[16].item + "";
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", a_href_value = "" + (/*story*/ ctx[16].link + "?lang=" + /*lang*/ ctx[3].toUpperCase()));
    			add_location(a, file$h, 57, 11, 1591);
    			attr_dev(li, "class", "svelte-183g6r3");
    			add_location(li, file$h, 57, 7, 1587);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*stories*/ 4 && t_value !== (t_value = /*story*/ ctx[16].item + "")) set_data_dev(t, t_value);

    			if (dirty & /*stories, lang*/ 12 && a_href_value !== (a_href_value = "" + (/*story*/ ctx[16].link + "?lang=" + /*lang*/ ctx[3].toUpperCase()))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(57:6) {#each stories as story}",
    		ctx
    	});

    	return block;
    }

    // (33:4) {#if opened}
    function create_if_block_2$4(ctx) {
    	let div;
    	let ul;
    	let div_transition;
    	let current;
    	let each_value = /*stories*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$a(get_each_context$a(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-183g6r3");
    			add_location(ul, file$h, 34, 5, 964);
    			attr_dev(div, "class", "pill-content-wrapper");
    			add_location(div, file$h, 33, 4, 891);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*stories, lang*/ 12) {
    				each_value = /*stories*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$a(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$a(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 600 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 600 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(33:4) {#if opened}",
    		ctx
    	});

    	return block;
    }

    // (36:6) {#each stories as story}
    function create_each_block$a(ctx) {
    	let li;
    	let a;
    	let t_value = /*story*/ ctx[16].item + "";
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", a_href_value = "" + (/*story*/ ctx[16].link + "?lang=" + /*lang*/ ctx[3].toUpperCase()));
    			add_location(a, file$h, 36, 11, 1011);
    			attr_dev(li, "class", "svelte-183g6r3");
    			add_location(li, file$h, 36, 7, 1007);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*stories*/ 4 && t_value !== (t_value = /*story*/ ctx[16].item + "")) set_data_dev(t, t_value);

    			if (dirty & /*stories, lang*/ 12 && a_href_value !== (a_href_value = "" + (/*story*/ ctx[16].link + "?lang=" + /*lang*/ ctx[3].toUpperCase()))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$a.name,
    		type: "each",
    		source: "(36:6) {#each stories as story}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let section;
    	let intersectionobserver;
    	let updating_intersecting;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[11]);

    	function intersectionobserver_intersecting_binding(value) {
    		/*intersectionobserver_intersecting_binding*/ ctx[13](value);
    	}

    	let intersectionobserver_props = {
    		element: /*element*/ ctx[5],
    		threshold: "1",
    		rootMargin: "100%",
    		$$slots: { default: [create_default_slot$3] },
    		$$scope: { ctx }
    	};

    	if (/*intersecting*/ ctx[6] !== void 0) {
    		intersectionobserver_props.intersecting = /*intersecting*/ ctx[6];
    	}

    	intersectionobserver = new IntersectionObserver_1({
    			props: intersectionobserver_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(intersectionobserver, "intersecting", intersectionobserver_intersecting_binding));
    	let if_block = /*intersecting*/ ctx[6] && create_if_block$a(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(intersectionobserver.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			add_location(section, file$h, 23, 0, 454);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(intersectionobserver, section, null);
    			append_dev(section, t);
    			if (if_block) if_block.m(section, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window_1$2, "resize", /*onwindowresize*/ ctx[11]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const intersectionobserver_changes = {};
    			if (dirty & /*element*/ 32) intersectionobserver_changes.element = /*element*/ ctx[5];

    			if (dirty & /*$$scope, element*/ 2097184) {
    				intersectionobserver_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_intersecting && dirty & /*intersecting*/ 64) {
    				updating_intersecting = true;
    				intersectionobserver_changes.intersecting = /*intersecting*/ ctx[6];
    				add_flush_callback(() => updating_intersecting = false);
    			}

    			intersectionobserver.$set(intersectionobserver_changes);

    			if (/*intersecting*/ ctx[6]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*intersecting*/ 64) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$a(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(section, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(intersectionobserver.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(intersectionobserver.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(intersectionobserver);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const more$1 = "Read more";

    function instance$h($$self, $$props, $$invalidate) {
    	let mobile;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Intro", slots, []);
    	let { tag } = $$props;
    	let { kicker } = $$props;
    	let { stories } = $$props;
    	let { lang } = $$props;
    	let element, intersecting, width, window, opened;

    	const open = () => {
    		$$invalidate(8, opened = !opened);
    	};

    	const writable_props = ["tag", "kicker", "stories", "lang"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Intro> was created with unknown prop '${key}'`);
    	});

    	function onwindowresize() {
    		$$invalidate(4, window = window_1$2.innerWidth);
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(5, element);
    		});
    	}

    	function intersectionobserver_intersecting_binding(value) {
    		intersecting = value;
    		$$invalidate(6, intersecting);
    	}

    	function div2_elementresize_handler() {
    		width = this.clientWidth;
    		$$invalidate(7, width);
    	}

    	function div2_elementresize_handler_1() {
    		width = this.clientWidth;
    		$$invalidate(7, width);
    	}

    	$$self.$$set = $$props => {
    		if ("tag" in $$props) $$invalidate(0, tag = $$props.tag);
    		if ("kicker" in $$props) $$invalidate(1, kicker = $$props.kicker);
    		if ("stories" in $$props) $$invalidate(2, stories = $$props.stories);
    		if ("lang" in $$props) $$invalidate(3, lang = $$props.lang);
    	};

    	$$self.$capture_state = () => ({
    		Video,
    		IntersectionObserver: IntersectionObserver_1,
    		fly,
    		fade,
    		tag,
    		kicker,
    		stories,
    		lang,
    		element,
    		intersecting,
    		width,
    		window,
    		opened,
    		more: more$1,
    		open,
    		mobile
    	});

    	$$self.$inject_state = $$props => {
    		if ("tag" in $$props) $$invalidate(0, tag = $$props.tag);
    		if ("kicker" in $$props) $$invalidate(1, kicker = $$props.kicker);
    		if ("stories" in $$props) $$invalidate(2, stories = $$props.stories);
    		if ("lang" in $$props) $$invalidate(3, lang = $$props.lang);
    		if ("element" in $$props) $$invalidate(5, element = $$props.element);
    		if ("intersecting" in $$props) $$invalidate(6, intersecting = $$props.intersecting);
    		if ("width" in $$props) $$invalidate(7, width = $$props.width);
    		if ("window" in $$props) $$invalidate(4, window = $$props.window);
    		if ("opened" in $$props) $$invalidate(8, opened = $$props.opened);
    		if ("mobile" in $$props) $$invalidate(9, mobile = $$props.mobile);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*window*/ 16) {
    			$$invalidate(9, mobile = window < 1008);
    		}
    	};

    	return [
    		tag,
    		kicker,
    		stories,
    		lang,
    		window,
    		element,
    		intersecting,
    		width,
    		opened,
    		mobile,
    		open,
    		onwindowresize,
    		div_binding,
    		intersectionobserver_intersecting_binding,
    		div2_elementresize_handler,
    		div2_elementresize_handler_1
    	];
    }

    class Intro extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { tag: 0, kicker: 1, stories: 2, lang: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Intro",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*tag*/ ctx[0] === undefined && !("tag" in props)) {
    			console.warn("<Intro> was created without expected prop 'tag'");
    		}

    		if (/*kicker*/ ctx[1] === undefined && !("kicker" in props)) {
    			console.warn("<Intro> was created without expected prop 'kicker'");
    		}

    		if (/*stories*/ ctx[2] === undefined && !("stories" in props)) {
    			console.warn("<Intro> was created without expected prop 'stories'");
    		}

    		if (/*lang*/ ctx[3] === undefined && !("lang" in props)) {
    			console.warn("<Intro> was created without expected prop 'lang'");
    		}
    	}

    	get tag() {
    		throw new Error("<Intro>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tag(value) {
    		throw new Error("<Intro>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get kicker() {
    		throw new Error("<Intro>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set kicker(value) {
    		throw new Error("<Intro>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stories() {
    		throw new Error("<Intro>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stories(value) {
    		throw new Error("<Intro>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lang() {
    		throw new Error("<Intro>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lang(value) {
    		throw new Error("<Intro>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/text/Text.svelte generated by Svelte v3.38.2 */

    const file$g = "src/components/text/Text.svelte";

    function get_each_context$9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (6:2) {#if head}
    function create_if_block_1$5(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			add_location(h2, file$g, 6, 2, 95);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			h2.innerHTML = /*head*/ ctx[1];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*head*/ 2) h2.innerHTML = /*head*/ ctx[1];		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(6:2) {#if head}",
    		ctx
    	});

    	return block;
    }

    // (9:2) {#if text}
    function create_if_block$9(ctx) {
    	let each_1_anchor;
    	let each_value = /*text*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$9(get_each_context$9(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text*/ 1) {
    				each_value = /*text*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$9(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$9(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(9:2) {#if text}",
    		ctx
    	});

    	return block;
    }

    // (10:2) {#each text as p,i}
    function create_each_block$9(ctx) {
    	let p;
    	let raw_value = /*p*/ ctx[2].p + "";

    	const block = {
    		c: function create() {
    			p = element("p");
    			attr_dev(p, "class", "" + (null_to_empty(/*i*/ ctx[4] > 0 ? "" : "has-dropcap") + " svelte-1nyxwig"));
    			add_location(p, file$g, 10, 6, 166);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			p.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text*/ 1 && raw_value !== (raw_value = /*p*/ ctx[2].p + "")) p.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$9.name,
    		type: "each",
    		source: "(10:2) {#each text as p,i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let section;
    	let t;
    	let if_block0 = /*head*/ ctx[1] && create_if_block_1$5(ctx);
    	let if_block1 = /*text*/ ctx[0] && create_if_block$9(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr_dev(section, "class", "col-text");
    			add_location(section, file$g, 4, 0, 53);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			if (if_block0) if_block0.m(section, null);
    			append_dev(section, t);
    			if (if_block1) if_block1.m(section, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*head*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$5(ctx);
    					if_block0.c();
    					if_block0.m(section, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*text*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$9(ctx);
    					if_block1.c();
    					if_block1.m(section, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Text", slots, []);
    	let { text } = $$props;
    	let { head } = $$props;
    	const writable_props = ["text", "head"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Text> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("head" in $$props) $$invalidate(1, head = $$props.head);
    	};

    	$$self.$capture_state = () => ({ text, head });

    	$$self.$inject_state = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("head" in $$props) $$invalidate(1, head = $$props.head);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text, head];
    }

    class Text extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { text: 0, head: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Text",
    			options,
    			id: create_fragment$g.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*text*/ ctx[0] === undefined && !("text" in props)) {
    			console.warn("<Text> was created without expected prop 'text'");
    		}

    		if (/*head*/ ctx[1] === undefined && !("head" in props)) {
    			console.warn("<Text> was created without expected prop 'head'");
    		}
    	}

    	get text() {
    		throw new Error("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get head() {
    		throw new Error("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set head(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/text/Footer.svelte generated by Svelte v3.38.2 */

    const file$f = "src/components/text/Footer.svelte";

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (13:6) {#if head}
    function create_if_block_2$3(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			add_location(h3, file$f, 13, 6, 237);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			h3.innerHTML = /*head*/ ctx[1];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*head*/ 2) h3.innerHTML = /*head*/ ctx[1];		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(13:6) {#if head}",
    		ctx
    	});

    	return block;
    }

    // (16:6) {#if text}
    function create_if_block$8(ctx) {
    	let each_1_anchor;
    	let each_value = /*text*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$8(get_each_context$8(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text, logos*/ 5) {
    				each_value = /*text*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$8(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$8(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(16:6) {#if text}",
    		ctx
    	});

    	return block;
    }

    // (19:10) {#if i < 3}
    function create_if_block_1$4(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "logo svelte-bvt8mq");
    			if (img.src !== (img_src_value = "./img/" + /*logos*/ ctx[2][/*i*/ ctx[5]])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Global Partnership Marine Litter, Cleans Seas and UNEP 50 logos");
    			add_location(img, file$f, 19, 10, 374);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(19:10) {#if i < 3}",
    		ctx
    	});

    	return block;
    }

    // (17:6) {#each text as p,i}
    function create_each_block$8(ctx) {
    	let div;
    	let t0;
    	let p;
    	let raw_value = /*p*/ ctx[3].p + "";
    	let t1;
    	let if_block = /*i*/ ctx[5] < 3 && create_if_block_1$4(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			p = element("p");
    			t1 = space();
    			attr_dev(p, "class", "svelte-bvt8mq");
    			add_location(p, file$f, 21, 10, 513);
    			attr_dev(div, "class", "third svelte-bvt8mq");
    			add_location(div, file$f, 17, 8, 322);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t0);
    			append_dev(div, p);
    			p.innerHTML = raw_value;
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (/*i*/ ctx[5] < 3) if_block.p(ctx, dirty);
    			if (dirty & /*text*/ 1 && raw_value !== (raw_value = /*p*/ ctx[3].p + "")) p.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$8.name,
    		type: "each",
    		source: "(17:6) {#each text as p,i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let div;
    	let section;
    	let t0;
    	let t1;
    	let img;
    	let img_src_value;
    	let if_block0 = /*head*/ ctx[1] && create_if_block_2$3(ctx);
    	let if_block1 = /*text*/ ctx[0] && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			section = element("section");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			img = element("img");
    			attr_dev(img, "class", "small-image svelte-bvt8mq");
    			if (img.src !== (img_src_value = "img/small-illos-04.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Abstract watercolor as an illustration for the the text below");
    			add_location(img, file$f, 25, 6, 579);
    			attr_dev(section, "class", "col-text well svelte-bvt8mq");
    			add_location(section, file$f, 11, 4, 182);
    			attr_dev(div, "class", "full blue svelte-bvt8mq");
    			add_location(div, file$f, 10, 4, 154);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, section);
    			if (if_block0) if_block0.m(section, null);
    			append_dev(section, t0);
    			if (if_block1) if_block1.m(section, null);
    			append_dev(section, t1);
    			append_dev(section, img);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*head*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$3(ctx);
    					if_block0.c();
    					if_block0.m(section, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*text*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$8(ctx);
    					if_block1.c();
    					if_block1.m(section, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	let { text } = $$props;
    	let { head } = $$props;
    	const logos = ["un-logo.svg", "clean.svg", "gpml.png"];
    	const writable_props = ["text", "head"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("head" in $$props) $$invalidate(1, head = $$props.head);
    	};

    	$$self.$capture_state = () => ({ text, head, logos });

    	$$self.$inject_state = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("head" in $$props) $$invalidate(1, head = $$props.head);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text, head, logos];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { text: 0, head: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$f.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*text*/ ctx[0] === undefined && !("text" in props)) {
    			console.warn("<Footer> was created without expected prop 'text'");
    		}

    		if (/*head*/ ctx[1] === undefined && !("head" in props)) {
    			console.warn("<Footer> was created without expected prop 'head'");
    		}
    	}

    	get text() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get head() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set head(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@sveltejs/svelte-scroller/Scroller.svelte generated by Svelte v3.38.2 */

    const { window: window_1$1 } = globals;
    const file$e = "node_modules/@sveltejs/svelte-scroller/Scroller.svelte";
    const get_foreground_slot_changes = dirty => ({});
    const get_foreground_slot_context = ctx => ({});
    const get_background_slot_changes = dirty => ({});
    const get_background_slot_context = ctx => ({});

    function create_fragment$e(ctx) {
    	let svelte_scroller_outer;
    	let svelte_scroller_background_container;
    	let svelte_scroller_background;
    	let t;
    	let svelte_scroller_foreground;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[20]);
    	const background_slot_template = /*#slots*/ ctx[19].background;
    	const background_slot = create_slot(background_slot_template, ctx, /*$$scope*/ ctx[18], get_background_slot_context);
    	const foreground_slot_template = /*#slots*/ ctx[19].foreground;
    	const foreground_slot = create_slot(foreground_slot_template, ctx, /*$$scope*/ ctx[18], get_foreground_slot_context);

    	const block = {
    		c: function create() {
    			svelte_scroller_outer = element("svelte-scroller-outer");
    			svelte_scroller_background_container = element("svelte-scroller-background-container");
    			svelte_scroller_background = element("svelte-scroller-background");
    			if (background_slot) background_slot.c();
    			t = space();
    			svelte_scroller_foreground = element("svelte-scroller-foreground");
    			if (foreground_slot) foreground_slot.c();
    			set_custom_element_data(svelte_scroller_background, "class", "svelte-xdbafy");
    			add_location(svelte_scroller_background, file$e, 169, 2, 3916);
    			set_custom_element_data(svelte_scroller_background_container, "class", "background-container svelte-xdbafy");
    			set_custom_element_data(svelte_scroller_background_container, "style", /*style*/ ctx[4]);
    			add_location(svelte_scroller_background_container, file$e, 168, 1, 3838);
    			set_custom_element_data(svelte_scroller_foreground, "class", "svelte-xdbafy");
    			add_location(svelte_scroller_foreground, file$e, 174, 1, 4078);
    			set_custom_element_data(svelte_scroller_outer, "class", "svelte-xdbafy");
    			add_location(svelte_scroller_outer, file$e, 167, 0, 3795);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svelte_scroller_outer, anchor);
    			append_dev(svelte_scroller_outer, svelte_scroller_background_container);
    			append_dev(svelte_scroller_background_container, svelte_scroller_background);

    			if (background_slot) {
    				background_slot.m(svelte_scroller_background, null);
    			}

    			/*svelte_scroller_background_binding*/ ctx[21](svelte_scroller_background);
    			append_dev(svelte_scroller_outer, t);
    			append_dev(svelte_scroller_outer, svelte_scroller_foreground);

    			if (foreground_slot) {
    				foreground_slot.m(svelte_scroller_foreground, null);
    			}

    			/*svelte_scroller_foreground_binding*/ ctx[22](svelte_scroller_foreground);
    			/*svelte_scroller_outer_binding*/ ctx[23](svelte_scroller_outer);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window_1$1, "resize", /*onwindowresize*/ ctx[20]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (background_slot) {
    				if (background_slot.p && (!current || dirty[0] & /*$$scope*/ 262144)) {
    					update_slot(background_slot, background_slot_template, ctx, /*$$scope*/ ctx[18], dirty, get_background_slot_changes, get_background_slot_context);
    				}
    			}

    			if (!current || dirty[0] & /*style*/ 16) {
    				set_custom_element_data(svelte_scroller_background_container, "style", /*style*/ ctx[4]);
    			}

    			if (foreground_slot) {
    				if (foreground_slot.p && (!current || dirty[0] & /*$$scope*/ 262144)) {
    					update_slot(foreground_slot, foreground_slot_template, ctx, /*$$scope*/ ctx[18], dirty, get_foreground_slot_changes, get_foreground_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(background_slot, local);
    			transition_in(foreground_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(background_slot, local);
    			transition_out(foreground_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svelte_scroller_outer);
    			if (background_slot) background_slot.d(detaching);
    			/*svelte_scroller_background_binding*/ ctx[21](null);
    			if (foreground_slot) foreground_slot.d(detaching);
    			/*svelte_scroller_foreground_binding*/ ctx[22](null);
    			/*svelte_scroller_outer_binding*/ ctx[23](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const handlers = [];
    let manager;

    if (typeof window !== "undefined") {
    	const run_all = () => handlers.forEach(fn => fn());
    	window.addEventListener("scroll", run_all);
    	window.addEventListener("resize", run_all);
    }

    if (typeof IntersectionObserver !== "undefined") {
    	const map = new Map();

    	const observer = new IntersectionObserver((entries, observer) => {
    			entries.forEach(entry => {
    				const update = map.get(entry.target);
    				const index = handlers.indexOf(update);

    				if (entry.isIntersecting) {
    					if (index === -1) handlers.push(update);
    				} else {
    					update();
    					if (index !== -1) handlers.splice(index, 1);
    				}
    			});
    		},
    	{
    			rootMargin: "400px 0px", // TODO why 400?
    			
    		});

    	manager = {
    		add: ({ outer, update }) => {
    			const { top, bottom } = outer.getBoundingClientRect();
    			if (top < window.innerHeight && bottom > 0) handlers.push(update);
    			map.set(outer, update);
    			observer.observe(outer);
    		},
    		remove: ({ outer, update }) => {
    			const index = handlers.indexOf(update);
    			if (index !== -1) handlers.splice(index, 1);
    			map.delete(outer);
    			observer.unobserve(outer);
    		}
    	};
    } else {
    	manager = {
    		add: ({ update }) => {
    			handlers.push(update);
    		},
    		remove: ({ update }) => {
    			const index = handlers.indexOf(update);
    			if (index !== -1) handlers.splice(index, 1);
    		}
    	};
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let top_px;
    	let bottom_px;
    	let threshold_px;
    	let style;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Scroller", slots, ['background','foreground']);
    	let { top = 0 } = $$props;
    	let { bottom = 1 } = $$props;
    	let { threshold = 0.5 } = $$props;
    	let { query = "section" } = $$props;
    	let { parallax = false } = $$props;
    	let { index = 0 } = $$props;
    	let { count = 0 } = $$props;
    	let { offset = 0 } = $$props;
    	let { progress = 0 } = $$props;
    	let { visible = false } = $$props;
    	let outer;
    	let foreground;
    	let background;
    	let left;
    	let sections;
    	let wh = 0;
    	let fixed;
    	let offset_top;
    	let width = 1;
    	let height;
    	let inverted;

    	onMount(() => {
    		sections = foreground.querySelectorAll(query);
    		$$invalidate(6, count = sections.length);
    		update();
    		const scroller = { outer, update };
    		manager.add(scroller);
    		return () => manager.remove(scroller);
    	});

    	function update() {
    		if (!foreground) return;

    		// re-measure outer container
    		const bcr = outer.getBoundingClientRect();

    		left = bcr.left;
    		$$invalidate(17, width = bcr.right - left);

    		// determine fix state
    		const fg = foreground.getBoundingClientRect();

    		const bg = background.getBoundingClientRect();
    		$$invalidate(9, visible = fg.top < wh && fg.bottom > 0);
    		const foreground_height = fg.bottom - fg.top;
    		const background_height = bg.bottom - bg.top;
    		const available_space = bottom_px - top_px;
    		$$invalidate(8, progress = (top_px - fg.top) / (foreground_height - available_space));

    		if (progress <= 0) {
    			$$invalidate(16, offset_top = 0);
    			$$invalidate(15, fixed = false);
    		} else if (progress >= 1) {
    			$$invalidate(16, offset_top = parallax
    			? foreground_height - background_height
    			: foreground_height - available_space);

    			$$invalidate(15, fixed = false);
    		} else {
    			$$invalidate(16, offset_top = parallax
    			? Math.round(top_px - progress * (background_height - available_space))
    			: top_px);

    			$$invalidate(15, fixed = true);
    		}

    		for ($$invalidate(5, index = 0); index < sections.length; $$invalidate(5, index += 1)) {
    			const section = sections[index];
    			const { top } = section.getBoundingClientRect();
    			const next = sections[index + 1];
    			const bottom = next ? next.getBoundingClientRect().top : fg.bottom;
    			$$invalidate(7, offset = (threshold_px - top) / (bottom - top));
    			if (bottom >= threshold_px) break;
    		}
    	}

    	const writable_props = [
    		"top",
    		"bottom",
    		"threshold",
    		"query",
    		"parallax",
    		"index",
    		"count",
    		"offset",
    		"progress",
    		"visible"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Scroller> was created with unknown prop '${key}'`);
    	});

    	function onwindowresize() {
    		$$invalidate(0, wh = window_1$1.innerHeight);
    	}

    	function svelte_scroller_background_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			background = $$value;
    			$$invalidate(3, background);
    		});
    	}

    	function svelte_scroller_foreground_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			foreground = $$value;
    			$$invalidate(2, foreground);
    		});
    	}

    	function svelte_scroller_outer_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			outer = $$value;
    			$$invalidate(1, outer);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("top" in $$props) $$invalidate(10, top = $$props.top);
    		if ("bottom" in $$props) $$invalidate(11, bottom = $$props.bottom);
    		if ("threshold" in $$props) $$invalidate(12, threshold = $$props.threshold);
    		if ("query" in $$props) $$invalidate(13, query = $$props.query);
    		if ("parallax" in $$props) $$invalidate(14, parallax = $$props.parallax);
    		if ("index" in $$props) $$invalidate(5, index = $$props.index);
    		if ("count" in $$props) $$invalidate(6, count = $$props.count);
    		if ("offset" in $$props) $$invalidate(7, offset = $$props.offset);
    		if ("progress" in $$props) $$invalidate(8, progress = $$props.progress);
    		if ("visible" in $$props) $$invalidate(9, visible = $$props.visible);
    		if ("$$scope" in $$props) $$invalidate(18, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		handlers,
    		manager,
    		onMount,
    		top,
    		bottom,
    		threshold,
    		query,
    		parallax,
    		index,
    		count,
    		offset,
    		progress,
    		visible,
    		outer,
    		foreground,
    		background,
    		left,
    		sections,
    		wh,
    		fixed,
    		offset_top,
    		width,
    		height,
    		inverted,
    		update,
    		top_px,
    		bottom_px,
    		threshold_px,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("top" in $$props) $$invalidate(10, top = $$props.top);
    		if ("bottom" in $$props) $$invalidate(11, bottom = $$props.bottom);
    		if ("threshold" in $$props) $$invalidate(12, threshold = $$props.threshold);
    		if ("query" in $$props) $$invalidate(13, query = $$props.query);
    		if ("parallax" in $$props) $$invalidate(14, parallax = $$props.parallax);
    		if ("index" in $$props) $$invalidate(5, index = $$props.index);
    		if ("count" in $$props) $$invalidate(6, count = $$props.count);
    		if ("offset" in $$props) $$invalidate(7, offset = $$props.offset);
    		if ("progress" in $$props) $$invalidate(8, progress = $$props.progress);
    		if ("visible" in $$props) $$invalidate(9, visible = $$props.visible);
    		if ("outer" in $$props) $$invalidate(1, outer = $$props.outer);
    		if ("foreground" in $$props) $$invalidate(2, foreground = $$props.foreground);
    		if ("background" in $$props) $$invalidate(3, background = $$props.background);
    		if ("left" in $$props) left = $$props.left;
    		if ("sections" in $$props) sections = $$props.sections;
    		if ("wh" in $$props) $$invalidate(0, wh = $$props.wh);
    		if ("fixed" in $$props) $$invalidate(15, fixed = $$props.fixed);
    		if ("offset_top" in $$props) $$invalidate(16, offset_top = $$props.offset_top);
    		if ("width" in $$props) $$invalidate(17, width = $$props.width);
    		if ("height" in $$props) height = $$props.height;
    		if ("inverted" in $$props) $$invalidate(30, inverted = $$props.inverted);
    		if ("top_px" in $$props) top_px = $$props.top_px;
    		if ("bottom_px" in $$props) bottom_px = $$props.bottom_px;
    		if ("threshold_px" in $$props) threshold_px = $$props.threshold_px;
    		if ("style" in $$props) $$invalidate(4, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*top, wh*/ 1025) {
    			top_px = Math.round(top * wh);
    		}

    		if ($$self.$$.dirty[0] & /*bottom, wh*/ 2049) {
    			bottom_px = Math.round(bottom * wh);
    		}

    		if ($$self.$$.dirty[0] & /*threshold, wh*/ 4097) {
    			threshold_px = Math.round(threshold * wh);
    		}

    		if ($$self.$$.dirty[0] & /*top, bottom, threshold, parallax*/ 23552) {
    			(update());
    		}

    		if ($$self.$$.dirty[0] & /*fixed, offset_top, width*/ 229376) {
    			$$invalidate(4, style = `
		position: ${fixed ? "fixed" : "absolute"};
		top: 0;
		transform: translate(0, ${offset_top}px);
		width: ${width}px;
		z-index: ${inverted ? 3 : 1};
	`);
    		}
    	};

    	return [
    		wh,
    		outer,
    		foreground,
    		background,
    		style,
    		index,
    		count,
    		offset,
    		progress,
    		visible,
    		top,
    		bottom,
    		threshold,
    		query,
    		parallax,
    		fixed,
    		offset_top,
    		width,
    		$$scope,
    		slots,
    		onwindowresize,
    		svelte_scroller_background_binding,
    		svelte_scroller_foreground_binding,
    		svelte_scroller_outer_binding
    	];
    }

    class Scroller extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$e,
    			create_fragment$e,
    			safe_not_equal,
    			{
    				top: 10,
    				bottom: 11,
    				threshold: 12,
    				query: 13,
    				parallax: 14,
    				index: 5,
    				count: 6,
    				offset: 7,
    				progress: 8,
    				visible: 9
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Scroller",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get top() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set top(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bottom() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bottom(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get threshold() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set threshold(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get query() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set query(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get parallax() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set parallax(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get count() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set count(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offset() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offset(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get progress() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set progress(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get visible() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/text/ChapterHeader.svelte generated by Svelte v3.38.2 */
    const file$d = "src/components/text/ChapterHeader.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    // (28:4) 
    function create_background_slot$3(ctx) {
    	let div2;
    	let div0;
    	let div0_class_value;
    	let t;
    	let div1;
    	let video_1;
    	let current;

    	video_1 = new Video({
    			props: {
    				src: "video/" + /*video*/ ctx[3],
    				layout: "cover"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			create_component(video_1.$$.fragment);
    			attr_dev(div0, "class", div0_class_value = "" + (null_to_empty(/*type*/ ctx[0] === "intro" ? "" : "gradient") + " svelte-1q0vrum"));
    			add_location(div0, file$d, 28, 8, 632);
    			attr_dev(div1, "class", "video-wrapper svelte-1q0vrum");

    			set_style(div1, "opacity", /*intersecting*/ ctx[9] && /*showVideo*/ ctx[10]()
    			? 1
    			: 0);

    			add_location(div1, file$d, 29, 8, 695);
    			attr_dev(div2, "slot", "background");
    			add_location(div2, file$d, 27, 4, 600);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t);
    			append_dev(div2, div1);
    			mount_component(video_1, div1, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*type*/ 1 && div0_class_value !== (div0_class_value = "" + (null_to_empty(/*type*/ ctx[0] === "intro" ? "" : "gradient") + " svelte-1q0vrum"))) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			const video_1_changes = {};
    			if (dirty & /*video*/ 8) video_1_changes.src = "video/" + /*video*/ ctx[3];
    			video_1.$set(video_1_changes);

    			if (!current || dirty & /*intersecting, showVideo*/ 1536) {
    				set_style(div1, "opacity", /*intersecting*/ ctx[9] && /*showVideo*/ ctx[10]()
    				? 1
    				: 0);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(video_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(video_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(video_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_background_slot$3.name,
    		type: "slot",
    		source: "(28:4) ",
    		ctx
    	});

    	return block;
    }

    // (42:14) {:else}
    function create_else_block_1(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			attr_dev(h2, "class", "narrow");
    			add_location(h2, file$d, 42, 14, 1228);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			h2.innerHTML = /*head*/ ctx[2];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*head*/ 4) h2.innerHTML = /*head*/ ctx[2];		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(42:14) {:else}",
    		ctx
    	});

    	return block;
    }

    // (40:14) {#if type === 'intro'}
    function create_if_block_2$2(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			attr_dev(h1, "class", "narrow");
    			add_location(h1, file$d, 40, 14, 1155);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			h1.innerHTML = /*head*/ ctx[2];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*head*/ 4) h1.innerHTML = /*head*/ ctx[2];		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(40:14) {#if type === 'intro'}",
    		ctx
    	});

    	return block;
    }

    // (38:6) <IntersectionObserver {element} on:observe="{(e) => {intersecting = e.detail.isIntersecting;}}" threshold=0 rootMargin='{(count) * 300}%'>
    function create_default_slot$2(ctx) {
    	let section;

    	function select_block_type(ctx, dirty) {
    		if (/*type*/ ctx[0] === "intro") return create_if_block_2$2;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			if_block.c();
    			attr_dev(section, "class", "step svelte-1q0vrum");
    			add_location(section, file$d, 38, 8, 1061);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			if_block.m(section, null);
    			/*section_binding*/ ctx[13](section);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(section, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if_block.d();
    			/*section_binding*/ ctx[13](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(38:6) <IntersectionObserver {element} on:observe=\\\"{(e) => {intersecting = e.detail.isIntersecting;}}\\\" threshold=0 rootMargin='{(count) * 300}%'>",
    		ctx
    	});

    	return block;
    }

    // (47:8) {#if text}
    function create_if_block$7(ctx) {
    	let each_1_anchor;
    	let each_value = /*text*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text, type*/ 3) {
    				each_value = /*text*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$7(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$7(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(47:8) {#if text}",
    		ctx
    	});

    	return block;
    }

    // (52:10) {:else}
    function create_else_block$3(ctx) {
    	let h3;
    	let span;
    	let raw_value = /*p*/ ctx[17].p + "";

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			span = element("span");
    			attr_dev(span, "class", "bg-text svelte-1q0vrum");
    			add_location(span, file$d, 52, 29, 1549);
    			attr_dev(h3, "class", "narrow");
    			add_location(h3, file$d, 52, 10, 1530);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, span);
    			span.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text*/ 2 && raw_value !== (raw_value = /*p*/ ctx[17].p + "")) span.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(52:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (50:10) {#if type === 'intro'}
    function create_if_block_1$3(ctx) {
    	let h3;
    	let raw_value = /*p*/ ctx[17].p + "";

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			attr_dev(h3, "class", "narrow shadow svelte-1q0vrum");
    			add_location(h3, file$d, 50, 10, 1459);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			h3.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text*/ 2 && raw_value !== (raw_value = /*p*/ ctx[17].p + "")) h3.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(50:10) {#if type === 'intro'}",
    		ctx
    	});

    	return block;
    }

    // (48:8) {#each text as p}
    function create_each_block$7(ctx) {
    	let section;
    	let t;

    	function select_block_type_1(ctx, dirty) {
    		if (/*type*/ ctx[0] === "intro") return create_if_block_1$3;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			if_block.c();
    			t = space();
    			attr_dev(section, "class", "step-below svelte-1q0vrum");
    			add_location(section, file$d, 48, 8, 1387);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			if_block.m(section, null);
    			append_dev(section, t);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(section, t);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(48:8) {#each text as p}",
    		ctx
    	});

    	return block;
    }

    // (37:4) 
    function create_foreground_slot$3(ctx) {
    	let div;
    	let intersectionobserver;
    	let t;
    	let current;

    	intersectionobserver = new IntersectionObserver_1({
    			props: {
    				element: /*element*/ ctx[8],
    				threshold: "0",
    				rootMargin: "" + (/*count*/ ctx[7] * 300 + "%"),
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	intersectionobserver.$on("observe", /*observe_handler*/ ctx[14]);
    	let if_block = /*text*/ ctx[1] && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(intersectionobserver.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(div, "slot", "foreground");
    			add_location(div, file$d, 36, 4, 884);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(intersectionobserver, div, null);
    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const intersectionobserver_changes = {};
    			if (dirty & /*element*/ 256) intersectionobserver_changes.element = /*element*/ ctx[8];
    			if (dirty & /*count*/ 128) intersectionobserver_changes.rootMargin = "" + (/*count*/ ctx[7] * 300 + "%");

    			if (dirty & /*$$scope, element, head, type*/ 1048837) {
    				intersectionobserver_changes.$$scope = { dirty, ctx };
    			}

    			intersectionobserver.$set(intersectionobserver_changes);

    			if (/*text*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(intersectionobserver.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(intersectionobserver.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(intersectionobserver);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_foreground_slot$3.name,
    		type: "slot",
    		source: "(37:4) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let scrolling = false;

    	let clear_scrolling = () => {
    		scrolling = false;
    	};

    	let scrolling_timeout;
    	let section;
    	let scroller;
    	let updating_index;
    	let updating_count;
    	let section_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowscroll*/ ctx[11]);
    	add_render_callback(/*onwindowresize*/ ctx[12]);

    	function scroller_index_binding(value) {
    		/*scroller_index_binding*/ ctx[15](value);
    	}

    	function scroller_count_binding(value) {
    		/*scroller_count_binding*/ ctx[16](value);
    	}

    	let scroller_props = {
    		top: 0,
    		bottom: 1,
    		$$slots: {
    			foreground: [create_foreground_slot$3],
    			background: [create_background_slot$3]
    		},
    		$$scope: { ctx }
    	};

    	if (/*index*/ ctx[6] !== void 0) {
    		scroller_props.index = /*index*/ ctx[6];
    	}

    	if (/*count*/ ctx[7] !== void 0) {
    		scroller_props.count = /*count*/ ctx[7];
    	}

    	scroller = new Scroller({ props: scroller_props, $$inline: true });
    	binding_callbacks.push(() => bind(scroller, "index", scroller_index_binding));
    	binding_callbacks.push(() => bind(scroller, "count", scroller_count_binding));

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(scroller.$$.fragment);
    			attr_dev(section, "class", section_class_value = "full " + /*type*/ ctx[0] + " " + (/*type*/ ctx[0] === "intro" ? "brown" : "") + " svelte-1q0vrum");
    			add_location(section, file$d, 19, 0, 448);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(scroller, section, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "scroll", () => {
    						scrolling = true;
    						clearTimeout(scrolling_timeout);
    						scrolling_timeout = setTimeout(clear_scrolling, 100);
    						/*onwindowscroll*/ ctx[11]();
    					}),
    					listen_dev(window, "resize", /*onwindowresize*/ ctx[12])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*y*/ 16 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo(window.pageXOffset, /*y*/ ctx[4]);
    				scrolling_timeout = setTimeout(clear_scrolling, 100);
    			}

    			const scroller_changes = {};

    			if (dirty & /*$$scope, text, type, element, count, intersecting, head, showVideo, video*/ 1050511) {
    				scroller_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_index && dirty & /*index*/ 64) {
    				updating_index = true;
    				scroller_changes.index = /*index*/ ctx[6];
    				add_flush_callback(() => updating_index = false);
    			}

    			if (!updating_count && dirty & /*count*/ 128) {
    				updating_count = true;
    				scroller_changes.count = /*count*/ ctx[7];
    				add_flush_callback(() => updating_count = false);
    			}

    			scroller.$set(scroller_changes);

    			if (!current || dirty & /*type*/ 1 && section_class_value !== (section_class_value = "full " + /*type*/ ctx[0] + " " + (/*type*/ ctx[0] === "intro" ? "brown" : "") + " svelte-1q0vrum")) {
    				attr_dev(section, "class", section_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(scroller.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(scroller.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(scroller);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let showVideo;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ChapterHeader", slots, []);
    	let { type } = $$props;
    	let { text } = $$props;
    	let { head } = $$props;
    	let { video } = $$props;
    	let index, count = 1, y, height;
    	let element, intersecting;
    	const writable_props = ["type", "text", "head", "video"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ChapterHeader> was created with unknown prop '${key}'`);
    	});

    	function onwindowscroll() {
    		$$invalidate(4, y = window.pageYOffset);
    	}

    	function onwindowresize() {
    		$$invalidate(5, height = window.innerHeight);
    	}

    	function section_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(8, element);
    		});
    	}

    	const observe_handler = e => {
    		$$invalidate(9, intersecting = e.detail.isIntersecting);
    	};

    	function scroller_index_binding(value) {
    		index = value;
    		$$invalidate(6, index);
    	}

    	function scroller_count_binding(value) {
    		count = value;
    		$$invalidate(7, count);
    	}

    	$$self.$$set = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    		if ("head" in $$props) $$invalidate(2, head = $$props.head);
    		if ("video" in $$props) $$invalidate(3, video = $$props.video);
    	};

    	$$self.$capture_state = () => ({
    		Scroller,
    		Video,
    		IntersectionObserver: IntersectionObserver_1,
    		type,
    		text,
    		head,
    		video,
    		index,
    		count,
    		y,
    		height,
    		element,
    		intersecting,
    		showVideo
    	});

    	$$self.$inject_state = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    		if ("head" in $$props) $$invalidate(2, head = $$props.head);
    		if ("video" in $$props) $$invalidate(3, video = $$props.video);
    		if ("index" in $$props) $$invalidate(6, index = $$props.index);
    		if ("count" in $$props) $$invalidate(7, count = $$props.count);
    		if ("y" in $$props) $$invalidate(4, y = $$props.y);
    		if ("height" in $$props) $$invalidate(5, height = $$props.height);
    		if ("element" in $$props) $$invalidate(8, element = $$props.element);
    		if ("intersecting" in $$props) $$invalidate(9, intersecting = $$props.intersecting);
    		if ("showVideo" in $$props) $$invalidate(10, showVideo = $$props.showVideo);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*y, height*/ 48) {
    			$$invalidate(10, showVideo = () => {
    				return y > height * 0.6;
    			});
    		}
    	};

    	return [
    		type,
    		text,
    		head,
    		video,
    		y,
    		height,
    		index,
    		count,
    		element,
    		intersecting,
    		showVideo,
    		onwindowscroll,
    		onwindowresize,
    		section_binding,
    		observe_handler,
    		scroller_index_binding,
    		scroller_count_binding
    	];
    }

    class ChapterHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { type: 0, text: 1, head: 2, video: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ChapterHeader",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*type*/ ctx[0] === undefined && !("type" in props)) {
    			console.warn("<ChapterHeader> was created without expected prop 'type'");
    		}

    		if (/*text*/ ctx[1] === undefined && !("text" in props)) {
    			console.warn("<ChapterHeader> was created without expected prop 'text'");
    		}

    		if (/*head*/ ctx[2] === undefined && !("head" in props)) {
    			console.warn("<ChapterHeader> was created without expected prop 'head'");
    		}

    		if (/*video*/ ctx[3] === undefined && !("video" in props)) {
    			console.warn("<ChapterHeader> was created without expected prop 'video'");
    		}
    	}

    	get type() {
    		throw new Error("<ChapterHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<ChapterHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<ChapterHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<ChapterHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get head() {
    		throw new Error("<ChapterHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set head(value) {
    		throw new Error("<ChapterHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get video() {
    		throw new Error("<ChapterHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set video(value) {
    		throw new Error("<ChapterHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/multimedia/Photo.svelte generated by Svelte v3.38.2 */

    const file$c = "src/components/multimedia/Photo.svelte";

    function create_fragment$c(ctx) {
    	let img;
    	let img_class_value;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", img_class_value = "" + (null_to_empty(/*layout*/ ctx[2]) + " svelte-mczv6o"));
    			if (img.src !== (img_src_value = /*src*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*alt*/ ctx[1]);
    			add_location(img, file$c, 6, 0, 77);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*layout*/ 4 && img_class_value !== (img_class_value = "" + (null_to_empty(/*layout*/ ctx[2]) + " svelte-mczv6o"))) {
    				attr_dev(img, "class", img_class_value);
    			}

    			if (dirty & /*src*/ 1 && img.src !== (img_src_value = /*src*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*alt*/ 2) {
    				attr_dev(img, "alt", /*alt*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Photo", slots, []);
    	let { src } = $$props;
    	let { alt } = $$props;
    	let { layout } = $$props;
    	const writable_props = ["src", "alt", "layout"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Photo> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    		if ("alt" in $$props) $$invalidate(1, alt = $$props.alt);
    		if ("layout" in $$props) $$invalidate(2, layout = $$props.layout);
    	};

    	$$self.$capture_state = () => ({ src, alt, layout });

    	$$self.$inject_state = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    		if ("alt" in $$props) $$invalidate(1, alt = $$props.alt);
    		if ("layout" in $$props) $$invalidate(2, layout = $$props.layout);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [src, alt, layout];
    }

    class Photo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { src: 0, alt: 1, layout: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Photo",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*src*/ ctx[0] === undefined && !("src" in props)) {
    			console.warn("<Photo> was created without expected prop 'src'");
    		}

    		if (/*alt*/ ctx[1] === undefined && !("alt" in props)) {
    			console.warn("<Photo> was created without expected prop 'alt'");
    		}

    		if (/*layout*/ ctx[2] === undefined && !("layout" in props)) {
    			console.warn("<Photo> was created without expected prop 'layout'");
    		}
    	}

    	get src() {
    		throw new Error("<Photo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<Photo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get alt() {
    		throw new Error("<Photo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alt(value) {
    		throw new Error("<Photo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get layout() {
    		throw new Error("<Photo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set layout(value) {
    		throw new Error("<Photo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/text/ScrollerGallery.svelte generated by Svelte v3.38.2 */
    const file$b = "src/components/text/ScrollerGallery.svelte";

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[11] = i;
    	return child_ctx;
    }

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (24:8) {#if i === index}
    function create_if_block_1$2(ctx) {
    	let div;
    	let photo;
    	let t;
    	let div_transition;
    	let current;

    	photo = new Photo({
    			props: {
    				src: "./img/" + /*p*/ ctx[7].img,
    				layout: "cover",
    				alt: /*p*/ ctx[7].p
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(photo.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "video-wrapper svelte-zvmr4c");
    			add_location(div, file$b, 24, 8, 451);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(photo, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const photo_changes = {};
    			if (dirty & /*text*/ 4) photo_changes.src = "./img/" + /*p*/ ctx[7].img;
    			if (dirty & /*text*/ 4) photo_changes.alt = /*p*/ ctx[7].p;
    			photo.$set(photo_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(photo.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 300 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(photo.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 300 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(photo);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(24:8) {#if i === index}",
    		ctx
    	});

    	return block;
    }

    // (23:6) {#each text as p,i}
    function create_each_block_1$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*i*/ ctx[11] === /*index*/ ctx[3] && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*i*/ ctx[11] === /*index*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*index*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(23:6) {#each text as p,i}",
    		ctx
    	});

    	return block;
    }

    // (22:4) 
    function create_background_slot$2(ctx) {
    	let div;
    	let current;
    	let each_value_1 = /*text*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "slot", "background");
    			add_location(div, file$b, 21, 4, 367);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text, index*/ 12) {
    				each_value_1 = /*text*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_background_slot$2.name,
    		type: "slot",
    		source: "(22:4) ",
    		ctx
    	});

    	return block;
    }

    // (37:6) {#if head}
    function create_if_block$6(ctx) {
    	let section;
    	let h2;

    	const block = {
    		c: function create() {
    			section = element("section");
    			h2 = element("h2");
    			attr_dev(h2, "class", "narrow");
    			add_location(h2, file$b, 38, 8, 767);
    			attr_dev(section, "class", "step svelte-zvmr4c");
    			add_location(section, file$b, 37, 6, 736);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h2);
    			h2.innerHTML = /*head*/ ctx[1];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*head*/ 2) h2.innerHTML = /*head*/ ctx[1];		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(37:6) {#if head}",
    		ctx
    	});

    	return block;
    }

    // (42:6) {#each text as p}
    function create_each_block$6(ctx) {
    	let section;
    	let h3;
    	let raw_value = /*p*/ ctx[7].p + "";
    	let t;

    	const block = {
    		c: function create() {
    			section = element("section");
    			h3 = element("h3");
    			t = space();
    			attr_dev(h3, "class", "narrow");
    			add_location(h3, file$b, 43, 10, 898);
    			attr_dev(section, "class", "step svelte-zvmr4c");
    			add_location(section, file$b, 42, 8, 865);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h3);
    			h3.innerHTML = raw_value;
    			append_dev(section, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text*/ 4 && raw_value !== (raw_value = /*p*/ ctx[7].p + "")) h3.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(42:6) {#each text as p}",
    		ctx
    	});

    	return block;
    }

    // (36:4) 
    function create_foreground_slot$2(ctx) {
    	let div;
    	let t;
    	let if_block = /*head*/ ctx[1] && create_if_block$6(ctx);
    	let each_value = /*text*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "slot", "foreground");
    			add_location(div, file$b, 35, 4, 689);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*head*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					if_block.m(div, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*text*/ 4) {
    				each_value = /*text*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_foreground_slot$2.name,
    		type: "slot",
    		source: "(36:4) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let section;
    	let scroller;
    	let updating_index;
    	let updating_count;
    	let section_class_value;
    	let current;

    	function scroller_index_binding(value) {
    		/*scroller_index_binding*/ ctx[5](value);
    	}

    	function scroller_count_binding(value) {
    		/*scroller_count_binding*/ ctx[6](value);
    	}

    	let scroller_props = {
    		top: 0,
    		bottom: 1,
    		$$slots: {
    			foreground: [create_foreground_slot$2],
    			background: [create_background_slot$2]
    		},
    		$$scope: { ctx }
    	};

    	if (/*index*/ ctx[3] !== void 0) {
    		scroller_props.index = /*index*/ ctx[3];
    	}

    	if (/*count*/ ctx[4] !== void 0) {
    		scroller_props.count = /*count*/ ctx[4];
    	}

    	scroller = new Scroller({ props: scroller_props, $$inline: true });
    	binding_callbacks.push(() => bind(scroller, "index", scroller_index_binding));
    	binding_callbacks.push(() => bind(scroller, "count", scroller_count_binding));

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(scroller.$$.fragment);
    			attr_dev(section, "class", section_class_value = "full " + /*type*/ ctx[0] + " svelte-zvmr4c");
    			add_location(section, file$b, 13, 0, 247);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(scroller, section, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const scroller_changes = {};

    			if (dirty & /*$$scope, text, head, index*/ 4110) {
    				scroller_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_index && dirty & /*index*/ 8) {
    				updating_index = true;
    				scroller_changes.index = /*index*/ ctx[3];
    				add_flush_callback(() => updating_index = false);
    			}

    			if (!updating_count && dirty & /*count*/ 16) {
    				updating_count = true;
    				scroller_changes.count = /*count*/ ctx[4];
    				add_flush_callback(() => updating_count = false);
    			}

    			scroller.$set(scroller_changes);

    			if (!current || dirty & /*type*/ 1 && section_class_value !== (section_class_value = "full " + /*type*/ ctx[0] + " svelte-zvmr4c")) {
    				attr_dev(section, "class", section_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(scroller.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(scroller.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(scroller);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ScrollerGallery", slots, []);
    	let { type } = $$props;
    	let { head } = $$props;
    	let { text } = $$props;
    	let index, count = 1;
    	const writable_props = ["type", "head", "text"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ScrollerGallery> was created with unknown prop '${key}'`);
    	});

    	function scroller_index_binding(value) {
    		index = value;
    		$$invalidate(3, index);
    	}

    	function scroller_count_binding(value) {
    		count = value;
    		$$invalidate(4, count);
    	}

    	$$self.$$set = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("head" in $$props) $$invalidate(1, head = $$props.head);
    		if ("text" in $$props) $$invalidate(2, text = $$props.text);
    	};

    	$$self.$capture_state = () => ({
    		Scroller,
    		Photo,
    		fade,
    		type,
    		head,
    		text,
    		index,
    		count
    	});

    	$$self.$inject_state = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("head" in $$props) $$invalidate(1, head = $$props.head);
    		if ("text" in $$props) $$invalidate(2, text = $$props.text);
    		if ("index" in $$props) $$invalidate(3, index = $$props.index);
    		if ("count" in $$props) $$invalidate(4, count = $$props.count);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [type, head, text, index, count, scroller_index_binding, scroller_count_binding];
    }

    class ScrollerGallery extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { type: 0, head: 1, text: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScrollerGallery",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*type*/ ctx[0] === undefined && !("type" in props)) {
    			console.warn("<ScrollerGallery> was created without expected prop 'type'");
    		}

    		if (/*head*/ ctx[1] === undefined && !("head" in props)) {
    			console.warn("<ScrollerGallery> was created without expected prop 'head'");
    		}

    		if (/*text*/ ctx[2] === undefined && !("text" in props)) {
    			console.warn("<ScrollerGallery> was created without expected prop 'text'");
    		}
    	}

    	get type() {
    		throw new Error("<ScrollerGallery>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<ScrollerGallery>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get head() {
    		throw new Error("<ScrollerGallery>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set head(value) {
    		throw new Error("<ScrollerGallery>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<ScrollerGallery>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<ScrollerGallery>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/text/ScrollerBigText.svelte generated by Svelte v3.38.2 */
    const file$a = "src/components/text/ScrollerBigText.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (22:4) 
    function create_background_slot$1(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let video;
    	let updating_time;
    	let updating_duration;
    	let current;

    	function video_time_binding(value) {
    		/*video_time_binding*/ ctx[6](value);
    	}

    	function video_duration_binding(value) {
    		/*video_duration_binding*/ ctx[7](value);
    	}

    	let video_props = {
    		noscroll: false,
    		src: /*src*/ ctx[2],
    		layout: "cover"
    	};

    	if (/*time*/ ctx[5] !== void 0) {
    		video_props.time = /*time*/ ctx[5];
    	}

    	if (/*duration*/ ctx[4] !== void 0) {
    		video_props.duration = /*duration*/ ctx[4];
    	}

    	video = new Video({ props: video_props, $$inline: true });
    	binding_callbacks.push(() => bind(video, "time", video_time_binding));
    	binding_callbacks.push(() => bind(video, "duration", video_duration_binding));

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			div2 = element("div");
    			create_component(video.$$.fragment);
    			attr_dev(div0, "class", "gradient svelte-1iibrdq");
    			add_location(div0, file$a, 22, 6, 382);
    			attr_dev(div1, "class", "gradient-bottom svelte-1iibrdq");
    			add_location(div1, file$a, 23, 6, 417);
    			attr_dev(div2, "class", "video-wrapper svelte-1iibrdq");
    			add_location(div2, file$a, 24, 8, 461);
    			attr_dev(div3, "slot", "background");
    			add_location(div3, file$a, 21, 4, 352);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			mount_component(video, div2, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const video_changes = {};
    			if (dirty & /*src*/ 4) video_changes.src = /*src*/ ctx[2];

    			if (!updating_time && dirty & /*time*/ 32) {
    				updating_time = true;
    				video_changes.time = /*time*/ ctx[5];
    				add_flush_callback(() => updating_time = false);
    			}

    			if (!updating_duration && dirty & /*duration*/ 16) {
    				updating_duration = true;
    				video_changes.duration = /*duration*/ ctx[4];
    				add_flush_callback(() => updating_duration = false);
    			}

    			video.$set(video_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(video.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(video.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(video);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_background_slot$1.name,
    		type: "slot",
    		source: "(22:4) ",
    		ctx
    	});

    	return block;
    }

    // (37:8) {#each text as p}
    function create_each_block$5(ctx) {
    	let section;
    	let img;
    	let img_src_value;
    	let t0;
    	let h3;
    	let raw_value = /*p*/ ctx[9].p + "";
    	let t1;

    	const block = {
    		c: function create() {
    			section = element("section");
    			img = element("img");
    			t0 = space();
    			h3 = element("h3");
    			t1 = space();
    			attr_dev(img, "class", "small-image svelte-1iibrdq");
    			if (img.src !== (img_src_value = "img/" + /*p*/ ctx[9].illo + ".png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Abstract watercolor as an illustration for the the text below");
    			add_location(img, file$a, 38, 10, 749);
    			attr_dev(h3, "class", "narrow svelte-1iibrdq");
    			add_location(h3, file$a, 39, 10, 877);
    			attr_dev(section, "class", "step svelte-1iibrdq");
    			add_location(section, file$a, 37, 8, 716);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, img);
    			append_dev(section, t0);
    			append_dev(section, h3);
    			h3.innerHTML = raw_value;
    			append_dev(section, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text*/ 2 && img.src !== (img_src_value = "img/" + /*p*/ ctx[9].illo + ".png")) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*text*/ 2 && raw_value !== (raw_value = /*p*/ ctx[9].p + "")) h3.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(37:8) {#each text as p}",
    		ctx
    	});

    	return block;
    }

    // (36:4) 
    function create_foreground_slot$1(ctx) {
    	let div;
    	let each_value = /*text*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "slot", "foreground");
    			add_location(div, file$a, 35, 4, 658);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text*/ 2) {
    				each_value = /*text*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_foreground_slot$1.name,
    		type: "slot",
    		source: "(36:4) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let section;
    	let scroller;
    	let updating_progress;
    	let section_class_value;
    	let current;

    	function scroller_progress_binding(value) {
    		/*scroller_progress_binding*/ ctx[8](value);
    	}

    	let scroller_props = {
    		top: 0,
    		bottom: 1,
    		$$slots: {
    			foreground: [create_foreground_slot$1],
    			background: [create_background_slot$1]
    		},
    		$$scope: { ctx }
    	};

    	if (/*progress*/ ctx[3] !== void 0) {
    		scroller_props.progress = /*progress*/ ctx[3];
    	}

    	scroller = new Scroller({ props: scroller_props, $$inline: true });
    	binding_callbacks.push(() => bind(scroller, "progress", scroller_progress_binding));

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(scroller.$$.fragment);
    			attr_dev(section, "class", section_class_value = "full " + /*type*/ ctx[0] + " diagram" + " svelte-1iibrdq");
    			add_location(section, file$a, 14, 0, 238);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(scroller, section, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const scroller_changes = {};

    			if (dirty & /*$$scope, text, src, time, duration*/ 4150) {
    				scroller_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_progress && dirty & /*progress*/ 8) {
    				updating_progress = true;
    				scroller_changes.progress = /*progress*/ ctx[3];
    				add_flush_callback(() => updating_progress = false);
    			}

    			scroller.$set(scroller_changes);

    			if (!current || dirty & /*type*/ 1 && section_class_value !== (section_class_value = "full " + /*type*/ ctx[0] + " diagram" + " svelte-1iibrdq")) {
    				attr_dev(section, "class", section_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(scroller.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(scroller.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(scroller);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let time;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ScrollerBigText", slots, []);
    	let { type } = $$props;
    	let { text } = $$props;
    	let { src } = $$props;
    	let progress, duration;
    	const writable_props = ["type", "text", "src"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ScrollerBigText> was created with unknown prop '${key}'`);
    	});

    	function video_time_binding(value) {
    		time = value;
    		(($$invalidate(5, time), $$invalidate(4, duration)), $$invalidate(3, progress));
    	}

    	function video_duration_binding(value) {
    		duration = value;
    		$$invalidate(4, duration);
    	}

    	function scroller_progress_binding(value) {
    		progress = value;
    		$$invalidate(3, progress);
    	}

    	$$self.$$set = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    		if ("src" in $$props) $$invalidate(2, src = $$props.src);
    	};

    	$$self.$capture_state = () => ({
    		Scroller,
    		Video,
    		type,
    		text,
    		src,
    		progress,
    		duration,
    		time
    	});

    	$$self.$inject_state = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    		if ("src" in $$props) $$invalidate(2, src = $$props.src);
    		if ("progress" in $$props) $$invalidate(3, progress = $$props.progress);
    		if ("duration" in $$props) $$invalidate(4, duration = $$props.duration);
    		if ("time" in $$props) $$invalidate(5, time = $$props.time);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*duration, progress*/ 24) {
    			$$invalidate(5, time = duration * progress);
    		}
    	};

    	return [
    		type,
    		text,
    		src,
    		progress,
    		duration,
    		time,
    		video_time_binding,
    		video_duration_binding,
    		scroller_progress_binding
    	];
    }

    class ScrollerBigText extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { type: 0, text: 1, src: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScrollerBigText",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*type*/ ctx[0] === undefined && !("type" in props)) {
    			console.warn("<ScrollerBigText> was created without expected prop 'type'");
    		}

    		if (/*text*/ ctx[1] === undefined && !("text" in props)) {
    			console.warn("<ScrollerBigText> was created without expected prop 'text'");
    		}

    		if (/*src*/ ctx[2] === undefined && !("src" in props)) {
    			console.warn("<ScrollerBigText> was created without expected prop 'src'");
    		}
    	}

    	get type() {
    		throw new Error("<ScrollerBigText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<ScrollerBigText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<ScrollerBigText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<ScrollerBigText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get src() {
    		throw new Error("<ScrollerBigText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<ScrollerBigText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/img/Illo.svelte generated by Svelte v3.38.2 */

    const file$9 = "src/components/img/Illo.svelte";

    function create_fragment$9(ctx) {
    	let section;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			section = element("section");
    			img = element("img");
    			attr_dev(img, "class", "right-illo svelte-1tubek4");
    			if (img.src !== (img_src_value = "./img/" + /*illo*/ ctx[0] + ".png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Abstract watercolor illustration");
    			add_location(img, file$9, 4, 0, 69);
    			attr_dev(section, "class", "full-width");
    			add_location(section, file$9, 3, 0, 40);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, img);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*illo*/ 1 && img.src !== (img_src_value = "./img/" + /*illo*/ ctx[0] + ".png")) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Illo", slots, []);
    	let { illo } = $$props;
    	const writable_props = ["illo"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Illo> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("illo" in $$props) $$invalidate(0, illo = $$props.illo);
    	};

    	$$self.$capture_state = () => ({ illo });

    	$$self.$inject_state = $$props => {
    		if ("illo" in $$props) $$invalidate(0, illo = $$props.illo);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [illo];
    }

    class Illo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { illo: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Illo",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*illo*/ ctx[0] === undefined && !("illo" in props)) {
    			console.warn("<Illo> was created without expected prop 'illo'");
    		}
    	}

    	get illo() {
    		throw new Error("<Illo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set illo(value) {
    		throw new Error("<Illo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/nav/Logo.svelte generated by Svelte v3.38.2 */

    const file$8 = "src/components/nav/Logo.svelte";

    function create_fragment$8(ctx) {
    	let a;
    	let img;
    	let img_class_value;
    	let img_src_value;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			img = element("img");
    			attr_dev(img, "class", img_class_value = "logo " + /*placement*/ ctx[0] + " " + /*align*/ ctx[3] + " svelte-14e8srt");

    			if (img.src !== (img_src_value = "./img/logo-" + (/*lang*/ ctx[2] === "id" || /*lang*/ ctx[2] === "pt" || /*lang*/ ctx[2] === "sw"
    			? "en"
    			: /*lang*/ ctx[2]) + ".svg")) attr_dev(img, "src", img_src_value);

    			attr_dev(img, "alt", /*alt*/ ctx[1]);
    			add_location(img, file$8, 8, 0, 173);

    			attr_dev(a, "href", a_href_value = "https://www.unep.org/" + (/*lang*/ ctx[2] === "id" || /*lang*/ ctx[2] === "en"
    			? ""
    			: /*lang*/ ctx[2]));

    			attr_dev(a, "class", "svelte-14e8srt");
    			add_location(a, file$8, 7, 0, 96);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, img);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*placement, align*/ 9 && img_class_value !== (img_class_value = "logo " + /*placement*/ ctx[0] + " " + /*align*/ ctx[3] + " svelte-14e8srt")) {
    				attr_dev(img, "class", img_class_value);
    			}

    			if (dirty & /*lang*/ 4 && img.src !== (img_src_value = "./img/logo-" + (/*lang*/ ctx[2] === "id" || /*lang*/ ctx[2] === "pt" || /*lang*/ ctx[2] === "sw"
    			? "en"
    			: /*lang*/ ctx[2]) + ".svg")) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*alt*/ 2) {
    				attr_dev(img, "alt", /*alt*/ ctx[1]);
    			}

    			if (dirty & /*lang*/ 4 && a_href_value !== (a_href_value = "https://www.unep.org/" + (/*lang*/ ctx[2] === "id" || /*lang*/ ctx[2] === "en"
    			? ""
    			: /*lang*/ ctx[2]))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Logo", slots, []);
    	let { placement } = $$props;
    	let { alt } = $$props;
    	let { lang } = $$props;
    	let { align } = $$props;
    	const writable_props = ["placement", "alt", "lang", "align"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Logo> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("placement" in $$props) $$invalidate(0, placement = $$props.placement);
    		if ("alt" in $$props) $$invalidate(1, alt = $$props.alt);
    		if ("lang" in $$props) $$invalidate(2, lang = $$props.lang);
    		if ("align" in $$props) $$invalidate(3, align = $$props.align);
    	};

    	$$self.$capture_state = () => ({ placement, alt, lang, align });

    	$$self.$inject_state = $$props => {
    		if ("placement" in $$props) $$invalidate(0, placement = $$props.placement);
    		if ("alt" in $$props) $$invalidate(1, alt = $$props.alt);
    		if ("lang" in $$props) $$invalidate(2, lang = $$props.lang);
    		if ("align" in $$props) $$invalidate(3, align = $$props.align);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [placement, alt, lang, align];
    }

    class Logo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { placement: 0, alt: 1, lang: 2, align: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Logo",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*placement*/ ctx[0] === undefined && !("placement" in props)) {
    			console.warn("<Logo> was created without expected prop 'placement'");
    		}

    		if (/*alt*/ ctx[1] === undefined && !("alt" in props)) {
    			console.warn("<Logo> was created without expected prop 'alt'");
    		}

    		if (/*lang*/ ctx[2] === undefined && !("lang" in props)) {
    			console.warn("<Logo> was created without expected prop 'lang'");
    		}

    		if (/*align*/ ctx[3] === undefined && !("align" in props)) {
    			console.warn("<Logo> was created without expected prop 'align'");
    		}
    	}

    	get placement() {
    		throw new Error("<Logo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placement(value) {
    		throw new Error("<Logo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get alt() {
    		throw new Error("<Logo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alt(value) {
    		throw new Error("<Logo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lang() {
    		throw new Error("<Logo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lang(value) {
    		throw new Error("<Logo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get align() {
    		throw new Error("<Logo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set align(value) {
    		throw new Error("<Logo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/nav/TopNav.svelte generated by Svelte v3.38.2 */
    const file$7 = "src/components/nav/TopNav.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (45:4) {:else}
    function create_else_block$2(ctx) {
    	let p;
    	let a;
    	let t0;
    	let t1;
    	let ul;
    	let each_value_1 = /*languages*/ ctx[9];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			p = element("p");
    			a = element("a");
    			t0 = text(/*short*/ ctx[1]);
    			t1 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(a, "href", /*link*/ ctx[2]);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "svelte-1y2v0ot");
    			add_location(a, file$7, 45, 24, 1071);
    			attr_dev(p, "class", "download svelte-1y2v0ot");
    			add_location(p, file$7, 45, 4, 1051);
    			attr_dev(ul, "class", "lang-menu svelte-1y2v0ot");
    			add_location(ul, file$7, 46, 4, 1124);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, a);
    			append_dev(a, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*short*/ 2) set_data_dev(t0, /*short*/ ctx[1]);

    			if (dirty & /*link*/ 4) {
    				attr_dev(a, "href", /*link*/ ctx[2]);
    			}

    			if (dirty & /*languages*/ 512) {
    				each_value_1 = /*languages*/ ctx[9];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(45:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (37:4) {#if desktop}
    function create_if_block$5(ctx) {
    	let ul;
    	let t0;
    	let li;
    	let a;
    	let t1;
    	let each_value = /*languages*/ ctx[9];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			li = element("li");
    			a = element("a");
    			t1 = text(/*item*/ ctx[0]);
    			attr_dev(a, "href", /*link*/ ctx[2]);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "svelte-1y2v0ot");
    			add_location(a, file$7, 41, 27, 975);
    			attr_dev(li, "class", "download svelte-1y2v0ot");
    			add_location(li, file$7, 41, 6, 954);
    			attr_dev(ul, "class", "svelte-1y2v0ot");
    			add_location(ul, file$7, 37, 4, 849);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(ul, t0);
    			append_dev(ul, li);
    			append_dev(li, a);
    			append_dev(a, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*languages*/ 512) {
    				each_value = /*languages*/ ctx[9];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, t0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*item*/ 1) set_data_dev(t1, /*item*/ ctx[0]);

    			if (dirty & /*link*/ 4) {
    				attr_dev(a, "href", /*link*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(37:4) {#if desktop}",
    		ctx
    	});

    	return block;
    }

    // (48:10) {#each languages as l}
    function create_each_block_1(ctx) {
    	let li;
    	let a;
    	let t_value = /*l*/ ctx[13].id + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", "?lang=" + /*l*/ ctx[13].id);
    			attr_dev(a, "class", "svelte-1y2v0ot");
    			add_location(a, file$7, 48, 14, 1194);
    			attr_dev(li, "class", "svelte-1y2v0ot");
    			add_location(li, file$7, 48, 10, 1190);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(48:10) {#each languages as l}",
    		ctx
    	});

    	return block;
    }

    // (39:6) {#each languages as l}
    function create_each_block$4(ctx) {
    	let li;
    	let a;
    	let t_value = /*l*/ ctx[13].name + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", "?lang=" + /*l*/ ctx[13].id);
    			attr_dev(a, "class", "svelte-1y2v0ot");
    			add_location(a, file$7, 39, 10, 893);
    			attr_dev(li, "class", "svelte-1y2v0ot");
    			add_location(li, file$7, 39, 6, 889);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(39:6) {#each languages as l}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let scrolling = false;

    	let clear_scrolling = () => {
    		scrolling = false;
    	};

    	let scrolling_timeout;
    	let nav;
    	let logo;
    	let t;
    	let nav_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowscroll*/ ctx[10]);
    	add_render_callback(/*onwindowresize*/ ctx[11]);

    	logo = new Logo({
    			props: {
    				alt: "UNEP@50 logo",
    				lang: /*lang*/ ctx[3],
    				placement: /*placement*/ ctx[7],
    				align: /*lang*/ ctx[3] === "ar" ? "right" : ""
    			},
    			$$inline: true
    		});

    	function select_block_type(ctx, dirty) {
    		if (/*desktop*/ ctx[8]) return create_if_block$5;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			create_component(logo.$$.fragment);
    			t = space();
    			if_block.c();
    			attr_dev(nav, "class", nav_class_value = "" + (null_to_empty(/*desktop*/ ctx[8] ? /*placement*/ ctx[7] : "below") + " svelte-1y2v0ot"));
    			add_location(nav, file$7, 27, 0, 672);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			mount_component(logo, nav, null);
    			append_dev(nav, t);
    			if_block.m(nav, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "scroll", () => {
    						scrolling = true;
    						clearTimeout(scrolling_timeout);
    						scrolling_timeout = setTimeout(clear_scrolling, 100);
    						/*onwindowscroll*/ ctx[10]();
    					}),
    					listen_dev(window, "resize", /*onwindowresize*/ ctx[11])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*y*/ 16 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo(window.pageXOffset, /*y*/ ctx[4]);
    				scrolling_timeout = setTimeout(clear_scrolling, 100);
    			}

    			const logo_changes = {};
    			if (dirty & /*lang*/ 8) logo_changes.lang = /*lang*/ ctx[3];
    			if (dirty & /*placement*/ 128) logo_changes.placement = /*placement*/ ctx[7];
    			if (dirty & /*lang*/ 8) logo_changes.align = /*lang*/ ctx[3] === "ar" ? "right" : "";
    			logo.$set(logo_changes);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(nav, null);
    				}
    			}

    			if (!current || dirty & /*desktop, placement*/ 384 && nav_class_value !== (nav_class_value = "" + (null_to_empty(/*desktop*/ ctx[8] ? /*placement*/ ctx[7] : "below") + " svelte-1y2v0ot"))) {
    				attr_dev(nav, "class", nav_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(logo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(logo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_component(logo);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let placement;
    	let desktop;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TopNav", slots, []);
    	let { item } = $$props;
    	let { short } = $$props;
    	let { link } = $$props;
    	let { lang } = $$props;
    	let y, width, height, submenu;

    	const languages = [
    		{ id: "EN", name: "English" },
    		{ id: "ES", name: "Español" },
    		{ id: "PT", name: "Português" },
    		{ id: "FR", name: "Français" },
    		{ id: "ZH", name: "简体中文" },
    		{ id: "AR", name: "العربية" },
    		{ id: "RU", name: "Русский" },
    		{ id: "SW", name: "Kiswahili" },
    		{ id: "ID", name: "Bahasa Indonesia" }
    	];

    	const writable_props = ["item", "short", "link", "lang"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TopNav> was created with unknown prop '${key}'`);
    	});

    	function onwindowscroll() {
    		$$invalidate(4, y = window.pageYOffset);
    	}

    	function onwindowresize() {
    		$$invalidate(5, width = window.innerWidth);
    		$$invalidate(6, height = window.innerHeight);
    	}

    	$$self.$$set = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    		if ("short" in $$props) $$invalidate(1, short = $$props.short);
    		if ("link" in $$props) $$invalidate(2, link = $$props.link);
    		if ("lang" in $$props) $$invalidate(3, lang = $$props.lang);
    	};

    	$$self.$capture_state = () => ({
    		Logo,
    		item,
    		short,
    		link,
    		lang,
    		y,
    		width,
    		height,
    		submenu,
    		languages,
    		placement,
    		desktop
    	});

    	$$self.$inject_state = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    		if ("short" in $$props) $$invalidate(1, short = $$props.short);
    		if ("link" in $$props) $$invalidate(2, link = $$props.link);
    		if ("lang" in $$props) $$invalidate(3, lang = $$props.lang);
    		if ("y" in $$props) $$invalidate(4, y = $$props.y);
    		if ("width" in $$props) $$invalidate(5, width = $$props.width);
    		if ("height" in $$props) $$invalidate(6, height = $$props.height);
    		if ("submenu" in $$props) submenu = $$props.submenu;
    		if ("placement" in $$props) $$invalidate(7, placement = $$props.placement);
    		if ("desktop" in $$props) $$invalidate(8, desktop = $$props.desktop);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*y, height*/ 80) {
    			$$invalidate(7, placement = y > height * 3.6 ? "below" : "");
    		}

    		if ($$self.$$.dirty & /*width*/ 32) {
    			$$invalidate(8, desktop = width > 1008);
    		}
    	};

    	return [
    		item,
    		short,
    		link,
    		lang,
    		y,
    		width,
    		height,
    		placement,
    		desktop,
    		languages,
    		onwindowscroll,
    		onwindowresize
    	];
    }

    class TopNav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { item: 0, short: 1, link: 2, lang: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TopNav",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*item*/ ctx[0] === undefined && !("item" in props)) {
    			console.warn("<TopNav> was created without expected prop 'item'");
    		}

    		if (/*short*/ ctx[1] === undefined && !("short" in props)) {
    			console.warn("<TopNav> was created without expected prop 'short'");
    		}

    		if (/*link*/ ctx[2] === undefined && !("link" in props)) {
    			console.warn("<TopNav> was created without expected prop 'link'");
    		}

    		if (/*lang*/ ctx[3] === undefined && !("lang" in props)) {
    			console.warn("<TopNav> was created without expected prop 'lang'");
    		}
    	}

    	get item() {
    		throw new Error("<TopNav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<TopNav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get short() {
    		throw new Error("<TopNav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set short(value) {
    		throw new Error("<TopNav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get link() {
    		throw new Error("<TopNav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<TopNav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lang() {
    		throw new Error("<TopNav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lang(value) {
    		throw new Error("<TopNav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/text/ScrollerDiagram.svelte generated by Svelte v3.38.2 */
    const file$6 = "src/components/text/ScrollerDiagram.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (23:6) 
    function create_background_slot(ctx) {
    	let div1;
    	let div0;
    	let video;
    	let updating_time;
    	let updating_duration;
    	let current;

    	function video_time_binding(value) {
    		/*video_time_binding*/ ctx[7](value);
    	}

    	function video_duration_binding(value) {
    		/*video_duration_binding*/ ctx[8](value);
    	}

    	let video_props = {
    		noscroll: false,
    		src: /*src*/ ctx[2],
    		layout: "cover"
    	};

    	if (/*time*/ ctx[6] !== void 0) {
    		video_props.time = /*time*/ ctx[6];
    	}

    	if (/*duration*/ ctx[5] !== void 0) {
    		video_props.duration = /*duration*/ ctx[5];
    	}

    	video = new Video({ props: video_props, $$inline: true });
    	binding_callbacks.push(() => bind(video, "time", video_time_binding));
    	binding_callbacks.push(() => bind(video, "duration", video_duration_binding));

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(video.$$.fragment);
    			attr_dev(div0, "class", "video-wrapper svelte-jiyxak");
    			add_location(div0, file$6, 23, 10, 427);
    			attr_dev(div1, "slot", "background");
    			add_location(div1, file$6, 22, 6, 393);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(video, div0, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const video_changes = {};
    			if (dirty & /*src*/ 4) video_changes.src = /*src*/ ctx[2];

    			if (!updating_time && dirty & /*time*/ 64) {
    				updating_time = true;
    				video_changes.time = /*time*/ ctx[6];
    				add_flush_callback(() => updating_time = false);
    			}

    			if (!updating_duration && dirty & /*duration*/ 32) {
    				updating_duration = true;
    				video_changes.duration = /*duration*/ ctx[5];
    				add_flush_callback(() => updating_duration = false);
    			}

    			video.$set(video_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(video.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(video.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(video);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_background_slot.name,
    		type: "slot",
    		source: "(23:6) ",
    		ctx
    	});

    	return block;
    }

    // (35:10) {#each text as p}
    function create_each_block$3(ctx) {
    	let section;
    	let h3;
    	let span;
    	let raw_value = /*p*/ ctx[10].p + "";
    	let span_class_value;
    	let t;

    	const block = {
    		c: function create() {
    			section = element("section");
    			h3 = element("h3");
    			span = element("span");
    			t = space();
    			attr_dev(span, "class", span_class_value = "bg-text " + /*bg*/ ctx[3] + " svelte-jiyxak");
    			add_location(span, file$6, 36, 31, 751);
    			attr_dev(h3, "class", "narrow");
    			add_location(h3, file$6, 36, 12, 732);
    			attr_dev(section, "class", "step svelte-jiyxak");
    			add_location(section, file$6, 35, 10, 697);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h3);
    			append_dev(h3, span);
    			span.innerHTML = raw_value;
    			append_dev(section, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text*/ 2 && raw_value !== (raw_value = /*p*/ ctx[10].p + "")) span.innerHTML = raw_value;
    			if (dirty & /*bg*/ 8 && span_class_value !== (span_class_value = "bg-text " + /*bg*/ ctx[3] + " svelte-jiyxak")) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(35:10) {#each text as p}",
    		ctx
    	});

    	return block;
    }

    // (34:6) 
    function create_foreground_slot(ctx) {
    	let div;
    	let each_value = /*text*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "slot", "foreground");
    			add_location(div, file$6, 33, 6, 635);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*bg, text*/ 10) {
    				each_value = /*text*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_foreground_slot.name,
    		type: "slot",
    		source: "(34:6) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let section;
    	let scroller;
    	let updating_progress;
    	let section_class_value;
    	let current;

    	function scroller_progress_binding(value) {
    		/*scroller_progress_binding*/ ctx[9](value);
    	}

    	let scroller_props = {
    		top: 0,
    		bottom: 1,
    		$$slots: {
    			foreground: [create_foreground_slot],
    			background: [create_background_slot]
    		},
    		$$scope: { ctx }
    	};

    	if (/*progress*/ ctx[4] !== void 0) {
    		scroller_props.progress = /*progress*/ ctx[4];
    	}

    	scroller = new Scroller({ props: scroller_props, $$inline: true });
    	binding_callbacks.push(() => bind(scroller, "progress", scroller_progress_binding));

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(scroller.$$.fragment);
    			attr_dev(section, "class", section_class_value = "full " + /*type*/ ctx[0] + " diagram" + " svelte-jiyxak");
    			add_location(section, file$6, 15, 0, 271);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(scroller, section, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const scroller_changes = {};

    			if (dirty & /*$$scope, text, bg, src, time, duration*/ 8302) {
    				scroller_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_progress && dirty & /*progress*/ 16) {
    				updating_progress = true;
    				scroller_changes.progress = /*progress*/ ctx[4];
    				add_flush_callback(() => updating_progress = false);
    			}

    			scroller.$set(scroller_changes);

    			if (!current || dirty & /*type*/ 1 && section_class_value !== (section_class_value = "full " + /*type*/ ctx[0] + " diagram" + " svelte-jiyxak")) {
    				attr_dev(section, "class", section_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(scroller.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(scroller.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(scroller);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let time;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ScrollerDiagram", slots, []);
    	let { type } = $$props;
    	let { text } = $$props;
    	let { src } = $$props;
    	let { bg } = $$props;
    	let progress, duration;
    	const writable_props = ["type", "text", "src", "bg"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ScrollerDiagram> was created with unknown prop '${key}'`);
    	});

    	function video_time_binding(value) {
    		time = value;
    		(($$invalidate(6, time), $$invalidate(5, duration)), $$invalidate(4, progress));
    	}

    	function video_duration_binding(value) {
    		duration = value;
    		$$invalidate(5, duration);
    	}

    	function scroller_progress_binding(value) {
    		progress = value;
    		$$invalidate(4, progress);
    	}

    	$$self.$$set = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    		if ("src" in $$props) $$invalidate(2, src = $$props.src);
    		if ("bg" in $$props) $$invalidate(3, bg = $$props.bg);
    	};

    	$$self.$capture_state = () => ({
    		Scroller,
    		Video,
    		type,
    		text,
    		src,
    		bg,
    		progress,
    		duration,
    		time
    	});

    	$$self.$inject_state = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    		if ("src" in $$props) $$invalidate(2, src = $$props.src);
    		if ("bg" in $$props) $$invalidate(3, bg = $$props.bg);
    		if ("progress" in $$props) $$invalidate(4, progress = $$props.progress);
    		if ("duration" in $$props) $$invalidate(5, duration = $$props.duration);
    		if ("time" in $$props) $$invalidate(6, time = $$props.time);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*duration, progress*/ 48) {
    			$$invalidate(6, time = duration * progress);
    		}
    	};

    	return [
    		type,
    		text,
    		src,
    		bg,
    		progress,
    		duration,
    		time,
    		video_time_binding,
    		video_duration_binding,
    		scroller_progress_binding
    	];
    }

    class ScrollerDiagram extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { type: 0, text: 1, src: 2, bg: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScrollerDiagram",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*type*/ ctx[0] === undefined && !("type" in props)) {
    			console.warn("<ScrollerDiagram> was created without expected prop 'type'");
    		}

    		if (/*text*/ ctx[1] === undefined && !("text" in props)) {
    			console.warn("<ScrollerDiagram> was created without expected prop 'text'");
    		}

    		if (/*src*/ ctx[2] === undefined && !("src" in props)) {
    			console.warn("<ScrollerDiagram> was created without expected prop 'src'");
    		}

    		if (/*bg*/ ctx[3] === undefined && !("bg" in props)) {
    			console.warn("<ScrollerDiagram> was created without expected prop 'bg'");
    		}
    	}

    	get type() {
    		throw new Error("<ScrollerDiagram>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<ScrollerDiagram>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<ScrollerDiagram>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<ScrollerDiagram>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get src() {
    		throw new Error("<ScrollerDiagram>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<ScrollerDiagram>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bg() {
    		throw new Error("<ScrollerDiagram>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bg(value) {
    		throw new Error("<ScrollerDiagram>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/text/Pill.svelte generated by Svelte v3.38.2 */

    const { window: window_1 } = globals;
    const file$5 = "src/components/text/Pill.svelte";

    // (22:1) <IntersectionObserver {element} bind:intersecting threshold=1>
    function create_default_slot$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "pill-location svelte-1s7uz7p");
    			add_location(div, file$5, 22, 2, 442);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[10](div);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[10](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(22:1) <IntersectionObserver {element} bind:intersecting threshold=1>",
    		ctx
    	});

    	return block;
    }

    // (25:1) {#if intersecting}
    function create_if_block$4(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*mobile*/ ctx[7]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(25:1) {#if intersecting}",
    		ctx
    	});

    	return block;
    }

    // (36:2) {:else}
    function create_else_block$1(ctx) {
    	let div1;
    	let div0;
    	let p;
    	let div1_resize_listener;
    	let div1_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			p = element("p");
    			attr_dev(p, "class", "svelte-1s7uz7p");
    			add_location(p, file$5, 38, 4, 1063);
    			attr_dev(div0, "class", "pill svelte-1s7uz7p");
    			add_location(div0, file$5, 37, 3, 1040);
    			attr_dev(div1, "class", "pill-wrapper svelte-1s7uz7p");
    			add_render_callback(() => /*div1_elementresize_handler*/ ctx[13].call(div1));
    			add_location(div1, file$5, 36, 2, 938);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, p);
    			p.innerHTML = /*long*/ ctx[1];
    			div1_resize_listener = add_resize_listener(div1, /*div1_elementresize_handler*/ ctx[13].bind(div1));
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (!current || dirty & /*long*/ 2) p.innerHTML = /*long*/ ctx[1];		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fly, { x: /*width*/ ctx[5], duration: 600 }, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fly, { x: /*width*/ ctx[5], duration: 600 }, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			div1_resize_listener();
    			if (detaching && div1_transition) div1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(36:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (26:2) {#if mobile}
    function create_if_block_1$1(ctx) {
    	let div2;
    	let div1;
    	let p;
    	let t0;
    	let t1;
    	let div0;
    	let div0_class_value;
    	let div1_class_value;
    	let div2_resize_listener;
    	let div2_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*opened*/ ctx[6] && create_if_block_2$1(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			p = element("p");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			div0 = element("div");
    			attr_dev(p, "class", "svelte-1s7uz7p");
    			add_location(p, file$5, 28, 4, 742);
    			attr_dev(div0, "class", div0_class_value = "icon " + (/*opened*/ ctx[6] ? "opened" : "closed") + " svelte-1s7uz7p");
    			add_location(div0, file$5, 32, 4, 851);
    			attr_dev(div1, "class", div1_class_value = "pill " + (/*opened*/ ctx[6] ? "pill--opened" : "pill--closed") + " svelte-1s7uz7p");
    			add_location(div1, file$5, 27, 3, 660);
    			attr_dev(div2, "class", "pill-wrapper svelte-1s7uz7p");
    			add_render_callback(() => /*div2_elementresize_handler*/ ctx[12].call(div2));
    			add_location(div2, file$5, 26, 2, 558);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, p);
    			p.innerHTML = /*short*/ ctx[0];
    			append_dev(div1, t0);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			div2_resize_listener = add_resize_listener(div2, /*div2_elementresize_handler*/ ctx[12].bind(div2));
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", /*open*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (!current || dirty & /*short*/ 1) p.innerHTML = /*short*/ ctx[0];
    			if (/*opened*/ ctx[6]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*opened*/ 64) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, t1);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*opened*/ 64 && div0_class_value !== (div0_class_value = "icon " + (/*opened*/ ctx[6] ? "opened" : "closed") + " svelte-1s7uz7p")) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (!current || dirty & /*opened*/ 64 && div1_class_value !== (div1_class_value = "pill " + (/*opened*/ ctx[6] ? "pill--opened" : "pill--closed") + " svelte-1s7uz7p")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fly, { x: /*width*/ ctx[5], duration: 600 }, true);
    				div2_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fly, { x: /*width*/ ctx[5], duration: 600 }, false);
    			div2_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    			div2_resize_listener();
    			if (detaching && div2_transition) div2_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(26:2) {#if mobile}",
    		ctx
    	});

    	return block;
    }

    // (30:4) {#if opened}
    function create_if_block_2$1(ctx) {
    	let p;
    	let p_transition;
    	let current;

    	const block = {
    		c: function create() {
    			p = element("p");
    			attr_dev(p, "class", "svelte-1s7uz7p");
    			add_location(p, file$5, 30, 4, 784);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			p.innerHTML = /*long*/ ctx[1];
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*long*/ 2) p.innerHTML = /*long*/ ctx[1];		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!p_transition) p_transition = create_bidirectional_transition(p, fade, { duration: 600 }, true);
    				p_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!p_transition) p_transition = create_bidirectional_transition(p, fade, { duration: 600 }, false);
    			p_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching && p_transition) p_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(30:4) {#if opened}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let section;
    	let intersectionobserver;
    	let updating_intersecting;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[9]);

    	function intersectionobserver_intersecting_binding(value) {
    		/*intersectionobserver_intersecting_binding*/ ctx[11](value);
    	}

    	let intersectionobserver_props = {
    		element: /*element*/ ctx[3],
    		threshold: "1",
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	};

    	if (/*intersecting*/ ctx[4] !== void 0) {
    		intersectionobserver_props.intersecting = /*intersecting*/ ctx[4];
    	}

    	intersectionobserver = new IntersectionObserver_1({
    			props: intersectionobserver_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(intersectionobserver, "intersecting", intersectionobserver_intersecting_binding));
    	let if_block = /*intersecting*/ ctx[4] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(intersectionobserver.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			add_location(section, file$5, 20, 0, 366);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(intersectionobserver, section, null);
    			append_dev(section, t);
    			if (if_block) if_block.m(section, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window_1, "resize", /*onwindowresize*/ ctx[9]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const intersectionobserver_changes = {};
    			if (dirty & /*element*/ 8) intersectionobserver_changes.element = /*element*/ ctx[3];

    			if (dirty & /*$$scope, element*/ 16392) {
    				intersectionobserver_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_intersecting && dirty & /*intersecting*/ 16) {
    				updating_intersecting = true;
    				intersectionobserver_changes.intersecting = /*intersecting*/ ctx[4];
    				add_flush_callback(() => updating_intersecting = false);
    			}

    			intersectionobserver.$set(intersectionobserver_changes);

    			if (/*intersecting*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*intersecting*/ 16) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(section, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(intersectionobserver.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(intersectionobserver.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(intersectionobserver);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const more = "Read more";

    function instance$5($$self, $$props, $$invalidate) {
    	let mobile;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Pill", slots, []);
    	let { short } = $$props;
    	let { long } = $$props;
    	let element, intersecting, width, window, opened;

    	const open = () => {
    		$$invalidate(6, opened = !opened);
    	};

    	const writable_props = ["short", "long"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Pill> was created with unknown prop '${key}'`);
    	});

    	function onwindowresize() {
    		$$invalidate(2, window = window_1.innerWidth);
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(3, element);
    		});
    	}

    	function intersectionobserver_intersecting_binding(value) {
    		intersecting = value;
    		$$invalidate(4, intersecting);
    	}

    	function div2_elementresize_handler() {
    		width = this.clientWidth;
    		$$invalidate(5, width);
    	}

    	function div1_elementresize_handler() {
    		width = this.clientWidth;
    		$$invalidate(5, width);
    	}

    	$$self.$$set = $$props => {
    		if ("short" in $$props) $$invalidate(0, short = $$props.short);
    		if ("long" in $$props) $$invalidate(1, long = $$props.long);
    	};

    	$$self.$capture_state = () => ({
    		IntersectionObserver: IntersectionObserver_1,
    		fly,
    		fade,
    		short,
    		long,
    		element,
    		intersecting,
    		width,
    		window,
    		opened,
    		more,
    		open,
    		mobile
    	});

    	$$self.$inject_state = $$props => {
    		if ("short" in $$props) $$invalidate(0, short = $$props.short);
    		if ("long" in $$props) $$invalidate(1, long = $$props.long);
    		if ("element" in $$props) $$invalidate(3, element = $$props.element);
    		if ("intersecting" in $$props) $$invalidate(4, intersecting = $$props.intersecting);
    		if ("width" in $$props) $$invalidate(5, width = $$props.width);
    		if ("window" in $$props) $$invalidate(2, window = $$props.window);
    		if ("opened" in $$props) $$invalidate(6, opened = $$props.opened);
    		if ("mobile" in $$props) $$invalidate(7, mobile = $$props.mobile);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*window*/ 4) {
    			$$invalidate(7, mobile = window < 778);
    		}
    	};

    	return [
    		short,
    		long,
    		window,
    		element,
    		intersecting,
    		width,
    		opened,
    		mobile,
    		open,
    		onwindowresize,
    		div_binding,
    		intersectionobserver_intersecting_binding,
    		div2_elementresize_handler,
    		div1_elementresize_handler
    	];
    }

    class Pill extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { short: 0, long: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pill",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*short*/ ctx[0] === undefined && !("short" in props)) {
    			console.warn("<Pill> was created without expected prop 'short'");
    		}

    		if (/*long*/ ctx[1] === undefined && !("long" in props)) {
    			console.warn("<Pill> was created without expected prop 'long'");
    		}
    	}

    	get short() {
    		throw new Error("<Pill>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set short(value) {
    		throw new Error("<Pill>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get long() {
    		throw new Error("<Pill>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set long(value) {
    		throw new Error("<Pill>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function formatDecimal(x) {
      return Math.abs(x = Math.round(x)) >= 1e21
          ? x.toLocaleString("en").replace(/,/g, "")
          : x.toString(10);
    }

    // Computes the decimal coefficient and exponent of the specified number x with
    // significant digits p, where x is positive and p is in [1, 21] or undefined.
    // For example, formatDecimalParts(1.23) returns ["123", 0].
    function formatDecimalParts(x, p) {
      if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
      var i, coefficient = x.slice(0, i);

      // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
      // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
      return [
        coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
        +x.slice(i + 1)
      ];
    }

    function exponent(x) {
      return x = formatDecimalParts(Math.abs(x)), x ? x[1] : NaN;
    }

    function formatGroup(grouping, thousands) {
      return function(value, width) {
        var i = value.length,
            t = [],
            j = 0,
            g = grouping[0],
            length = 0;

        while (i > 0 && g > 0) {
          if (length + g + 1 > width) g = Math.max(1, width - length);
          t.push(value.substring(i -= g, i + g));
          if ((length += g + 1) > width) break;
          g = grouping[j = (j + 1) % grouping.length];
        }

        return t.reverse().join(thousands);
      };
    }

    function formatNumerals(numerals) {
      return function(value) {
        return value.replace(/[0-9]/g, function(i) {
          return numerals[+i];
        });
      };
    }

    // [[fill]align][sign][symbol][0][width][,][.precision][~][type]
    var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;

    function formatSpecifier(specifier) {
      if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
      var match;
      return new FormatSpecifier({
        fill: match[1],
        align: match[2],
        sign: match[3],
        symbol: match[4],
        zero: match[5],
        width: match[6],
        comma: match[7],
        precision: match[8] && match[8].slice(1),
        trim: match[9],
        type: match[10]
      });
    }

    formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

    function FormatSpecifier(specifier) {
      this.fill = specifier.fill === undefined ? " " : specifier.fill + "";
      this.align = specifier.align === undefined ? ">" : specifier.align + "";
      this.sign = specifier.sign === undefined ? "-" : specifier.sign + "";
      this.symbol = specifier.symbol === undefined ? "" : specifier.symbol + "";
      this.zero = !!specifier.zero;
      this.width = specifier.width === undefined ? undefined : +specifier.width;
      this.comma = !!specifier.comma;
      this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
      this.trim = !!specifier.trim;
      this.type = specifier.type === undefined ? "" : specifier.type + "";
    }

    FormatSpecifier.prototype.toString = function() {
      return this.fill
          + this.align
          + this.sign
          + this.symbol
          + (this.zero ? "0" : "")
          + (this.width === undefined ? "" : Math.max(1, this.width | 0))
          + (this.comma ? "," : "")
          + (this.precision === undefined ? "" : "." + Math.max(0, this.precision | 0))
          + (this.trim ? "~" : "")
          + this.type;
    };

    // Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
    function formatTrim(s) {
      out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
        switch (s[i]) {
          case ".": i0 = i1 = i; break;
          case "0": if (i0 === 0) i0 = i; i1 = i; break;
          default: if (!+s[i]) break out; if (i0 > 0) i0 = 0; break;
        }
      }
      return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
    }

    var prefixExponent;

    function formatPrefixAuto(x, p) {
      var d = formatDecimalParts(x, p);
      if (!d) return x + "";
      var coefficient = d[0],
          exponent = d[1],
          i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
          n = coefficient.length;
      return i === n ? coefficient
          : i > n ? coefficient + new Array(i - n + 1).join("0")
          : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
          : "0." + new Array(1 - i).join("0") + formatDecimalParts(x, Math.max(0, p + i - 1))[0]; // less than 1y!
    }

    function formatRounded(x, p) {
      var d = formatDecimalParts(x, p);
      if (!d) return x + "";
      var coefficient = d[0],
          exponent = d[1];
      return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
          : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
          : coefficient + new Array(exponent - coefficient.length + 2).join("0");
    }

    var formatTypes = {
      "%": (x, p) => (x * 100).toFixed(p),
      "b": (x) => Math.round(x).toString(2),
      "c": (x) => x + "",
      "d": formatDecimal,
      "e": (x, p) => x.toExponential(p),
      "f": (x, p) => x.toFixed(p),
      "g": (x, p) => x.toPrecision(p),
      "o": (x) => Math.round(x).toString(8),
      "p": (x, p) => formatRounded(x * 100, p),
      "r": formatRounded,
      "s": formatPrefixAuto,
      "X": (x) => Math.round(x).toString(16).toUpperCase(),
      "x": (x) => Math.round(x).toString(16)
    };

    function identity(x) {
      return x;
    }

    var map = Array.prototype.map,
        prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

    function formatLocale$1(locale) {
      var group = locale.grouping === undefined || locale.thousands === undefined ? identity : formatGroup(map.call(locale.grouping, Number), locale.thousands + ""),
          currencyPrefix = locale.currency === undefined ? "" : locale.currency[0] + "",
          currencySuffix = locale.currency === undefined ? "" : locale.currency[1] + "",
          decimal = locale.decimal === undefined ? "." : locale.decimal + "",
          numerals = locale.numerals === undefined ? identity : formatNumerals(map.call(locale.numerals, String)),
          percent = locale.percent === undefined ? "%" : locale.percent + "",
          minus = locale.minus === undefined ? "−" : locale.minus + "",
          nan = locale.nan === undefined ? "NaN" : locale.nan + "";

      function newFormat(specifier) {
        specifier = formatSpecifier(specifier);

        var fill = specifier.fill,
            align = specifier.align,
            sign = specifier.sign,
            symbol = specifier.symbol,
            zero = specifier.zero,
            width = specifier.width,
            comma = specifier.comma,
            precision = specifier.precision,
            trim = specifier.trim,
            type = specifier.type;

        // The "n" type is an alias for ",g".
        if (type === "n") comma = true, type = "g";

        // The "" type, and any invalid type, is an alias for ".12~g".
        else if (!formatTypes[type]) precision === undefined && (precision = 12), trim = true, type = "g";

        // If zero fill is specified, padding goes after sign and before digits.
        if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

        // Compute the prefix and suffix.
        // For SI-prefix, the suffix is lazily computed.
        var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
            suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";

        // What format function should we use?
        // Is this an integer type?
        // Can this type generate exponential notation?
        var formatType = formatTypes[type],
            maybeSuffix = /[defgprs%]/.test(type);

        // Set the default precision if not specified,
        // or clamp the specified precision to the supported range.
        // For significant precision, it must be in [1, 21].
        // For fixed precision, it must be in [0, 20].
        precision = precision === undefined ? 6
            : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
            : Math.max(0, Math.min(20, precision));

        function format(value) {
          var valuePrefix = prefix,
              valueSuffix = suffix,
              i, n, c;

          if (type === "c") {
            valueSuffix = formatType(value) + valueSuffix;
            value = "";
          } else {
            value = +value;

            // Determine the sign. -0 is not less than 0, but 1 / -0 is!
            var valueNegative = value < 0 || 1 / value < 0;

            // Perform the initial formatting.
            value = isNaN(value) ? nan : formatType(Math.abs(value), precision);

            // Trim insignificant zeros.
            if (trim) value = formatTrim(value);

            // If a negative value rounds to zero after formatting, and no explicit positive sign is requested, hide the sign.
            if (valueNegative && +value === 0 && sign !== "+") valueNegative = false;

            // Compute the prefix and suffix.
            valuePrefix = (valueNegative ? (sign === "(" ? sign : minus) : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
            valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");

            // Break the formatted value into the integer “value” part that can be
            // grouped, and fractional or exponential “suffix” part that is not.
            if (maybeSuffix) {
              i = -1, n = value.length;
              while (++i < n) {
                if (c = value.charCodeAt(i), 48 > c || c > 57) {
                  valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                  value = value.slice(0, i);
                  break;
                }
              }
            }
          }

          // If the fill character is not "0", grouping is applied before padding.
          if (comma && !zero) value = group(value, Infinity);

          // Compute the padding.
          var length = valuePrefix.length + value.length + valueSuffix.length,
              padding = length < width ? new Array(width - length + 1).join(fill) : "";

          // If the fill character is "0", grouping is applied after padding.
          if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

          // Reconstruct the final output based on the desired alignment.
          switch (align) {
            case "<": value = valuePrefix + value + valueSuffix + padding; break;
            case "=": value = valuePrefix + padding + value + valueSuffix; break;
            case "^": value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length); break;
            default: value = padding + valuePrefix + value + valueSuffix; break;
          }

          return numerals(value);
        }

        format.toString = function() {
          return specifier + "";
        };

        return format;
      }

      function formatPrefix(specifier, value) {
        var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
            e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
            k = Math.pow(10, -e),
            prefix = prefixes[8 + e / 3];
        return function(value) {
          return f(k * value) + prefix;
        };
      }

      return {
        format: newFormat,
        formatPrefix: formatPrefix
      };
    }

    var locale$1;
    var format;
    var formatPrefix;

    defaultLocale$1({
      thousands: ",",
      grouping: [3],
      currency: ["$", ""]
    });

    function defaultLocale$1(definition) {
      locale$1 = formatLocale$1(definition);
      format = locale$1.format;
      formatPrefix = locale$1.formatPrefix;
      return locale$1;
    }

    function precisionFixed(step) {
      return Math.max(0, -exponent(Math.abs(step)));
    }

    function precisionPrefix(step, value) {
      return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
    }

    function precisionRound(step, max) {
      step = Math.abs(step), max = Math.abs(max) - step;
      return Math.max(0, exponent(max) - exponent(step)) + 1;
    }

    var src$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        formatDefaultLocale: defaultLocale$1,
        get format () { return format; },
        get formatPrefix () { return formatPrefix; },
        formatLocale: formatLocale$1,
        formatSpecifier: formatSpecifier,
        FormatSpecifier: FormatSpecifier,
        precisionFixed: precisionFixed,
        precisionPrefix: precisionPrefix,
        precisionRound: precisionRound
    });

    var t0 = new Date,
        t1 = new Date;

    function newInterval(floori, offseti, count, field) {

      function interval(date) {
        return floori(date = arguments.length === 0 ? new Date : new Date(+date)), date;
      }

      interval.floor = function(date) {
        return floori(date = new Date(+date)), date;
      };

      interval.ceil = function(date) {
        return floori(date = new Date(date - 1)), offseti(date, 1), floori(date), date;
      };

      interval.round = function(date) {
        var d0 = interval(date),
            d1 = interval.ceil(date);
        return date - d0 < d1 - date ? d0 : d1;
      };

      interval.offset = function(date, step) {
        return offseti(date = new Date(+date), step == null ? 1 : Math.floor(step)), date;
      };

      interval.range = function(start, stop, step) {
        var range = [], previous;
        start = interval.ceil(start);
        step = step == null ? 1 : Math.floor(step);
        if (!(start < stop) || !(step > 0)) return range; // also handles Invalid Date
        do range.push(previous = new Date(+start)), offseti(start, step), floori(start);
        while (previous < start && start < stop);
        return range;
      };

      interval.filter = function(test) {
        return newInterval(function(date) {
          if (date >= date) while (floori(date), !test(date)) date.setTime(date - 1);
        }, function(date, step) {
          if (date >= date) {
            if (step < 0) while (++step <= 0) {
              while (offseti(date, -1), !test(date)) {} // eslint-disable-line no-empty
            } else while (--step >= 0) {
              while (offseti(date, +1), !test(date)) {} // eslint-disable-line no-empty
            }
          }
        });
      };

      if (count) {
        interval.count = function(start, end) {
          t0.setTime(+start), t1.setTime(+end);
          floori(t0), floori(t1);
          return Math.floor(count(t0, t1));
        };

        interval.every = function(step) {
          step = Math.floor(step);
          return !isFinite(step) || !(step > 0) ? null
              : !(step > 1) ? interval
              : interval.filter(field
                  ? function(d) { return field(d) % step === 0; }
                  : function(d) { return interval.count(0, d) % step === 0; });
        };
      }

      return interval;
    }

    const durationSecond = 1000;
    const durationMinute = durationSecond * 60;
    const durationHour = durationMinute * 60;
    const durationDay = durationHour * 24;
    const durationWeek = durationDay * 7;

    var day = newInterval(
      date => date.setHours(0, 0, 0, 0),
      (date, step) => date.setDate(date.getDate() + step),
      (start, end) => (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationDay,
      date => date.getDate() - 1
    );

    function weekday(i) {
      return newInterval(function(date) {
        date.setDate(date.getDate() - (date.getDay() + 7 - i) % 7);
        date.setHours(0, 0, 0, 0);
      }, function(date, step) {
        date.setDate(date.getDate() + step * 7);
      }, function(start, end) {
        return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationWeek;
      });
    }

    var sunday = weekday(0);
    var monday = weekday(1);
    weekday(2);
    weekday(3);
    var thursday = weekday(4);
    weekday(5);
    weekday(6);

    var year = newInterval(function(date) {
      date.setMonth(0, 1);
      date.setHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setFullYear(date.getFullYear() + step);
    }, function(start, end) {
      return end.getFullYear() - start.getFullYear();
    }, function(date) {
      return date.getFullYear();
    });

    // An optimized implementation for this simple case.
    year.every = function(k) {
      return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
        date.setFullYear(Math.floor(date.getFullYear() / k) * k);
        date.setMonth(0, 1);
        date.setHours(0, 0, 0, 0);
      }, function(date, step) {
        date.setFullYear(date.getFullYear() + step * k);
      });
    };

    var utcDay = newInterval(function(date) {
      date.setUTCHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setUTCDate(date.getUTCDate() + step);
    }, function(start, end) {
      return (end - start) / durationDay;
    }, function(date) {
      return date.getUTCDate() - 1;
    });

    function utcWeekday(i) {
      return newInterval(function(date) {
        date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - i) % 7);
        date.setUTCHours(0, 0, 0, 0);
      }, function(date, step) {
        date.setUTCDate(date.getUTCDate() + step * 7);
      }, function(start, end) {
        return (end - start) / durationWeek;
      });
    }

    var utcSunday = utcWeekday(0);
    var utcMonday = utcWeekday(1);
    utcWeekday(2);
    utcWeekday(3);
    var utcThursday = utcWeekday(4);
    utcWeekday(5);
    utcWeekday(6);

    var utcYear = newInterval(function(date) {
      date.setUTCMonth(0, 1);
      date.setUTCHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setUTCFullYear(date.getUTCFullYear() + step);
    }, function(start, end) {
      return end.getUTCFullYear() - start.getUTCFullYear();
    }, function(date) {
      return date.getUTCFullYear();
    });

    // An optimized implementation for this simple case.
    utcYear.every = function(k) {
      return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
        date.setUTCFullYear(Math.floor(date.getUTCFullYear() / k) * k);
        date.setUTCMonth(0, 1);
        date.setUTCHours(0, 0, 0, 0);
      }, function(date, step) {
        date.setUTCFullYear(date.getUTCFullYear() + step * k);
      });
    };

    function localDate(d) {
      if (0 <= d.y && d.y < 100) {
        var date = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
        date.setFullYear(d.y);
        return date;
      }
      return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
    }

    function utcDate(d) {
      if (0 <= d.y && d.y < 100) {
        var date = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
        date.setUTCFullYear(d.y);
        return date;
      }
      return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
    }

    function newDate(y, m, d) {
      return {y: y, m: m, d: d, H: 0, M: 0, S: 0, L: 0};
    }

    function formatLocale(locale) {
      var locale_dateTime = locale.dateTime,
          locale_date = locale.date,
          locale_time = locale.time,
          locale_periods = locale.periods,
          locale_weekdays = locale.days,
          locale_shortWeekdays = locale.shortDays,
          locale_months = locale.months,
          locale_shortMonths = locale.shortMonths;

      var periodRe = formatRe(locale_periods),
          periodLookup = formatLookup(locale_periods),
          weekdayRe = formatRe(locale_weekdays),
          weekdayLookup = formatLookup(locale_weekdays),
          shortWeekdayRe = formatRe(locale_shortWeekdays),
          shortWeekdayLookup = formatLookup(locale_shortWeekdays),
          monthRe = formatRe(locale_months),
          monthLookup = formatLookup(locale_months),
          shortMonthRe = formatRe(locale_shortMonths),
          shortMonthLookup = formatLookup(locale_shortMonths);

      var formats = {
        "a": formatShortWeekday,
        "A": formatWeekday,
        "b": formatShortMonth,
        "B": formatMonth,
        "c": null,
        "d": formatDayOfMonth,
        "e": formatDayOfMonth,
        "f": formatMicroseconds,
        "g": formatYearISO,
        "G": formatFullYearISO,
        "H": formatHour24,
        "I": formatHour12,
        "j": formatDayOfYear,
        "L": formatMilliseconds,
        "m": formatMonthNumber,
        "M": formatMinutes,
        "p": formatPeriod,
        "q": formatQuarter,
        "Q": formatUnixTimestamp,
        "s": formatUnixTimestampSeconds,
        "S": formatSeconds,
        "u": formatWeekdayNumberMonday,
        "U": formatWeekNumberSunday,
        "V": formatWeekNumberISO,
        "w": formatWeekdayNumberSunday,
        "W": formatWeekNumberMonday,
        "x": null,
        "X": null,
        "y": formatYear,
        "Y": formatFullYear,
        "Z": formatZone,
        "%": formatLiteralPercent
      };

      var utcFormats = {
        "a": formatUTCShortWeekday,
        "A": formatUTCWeekday,
        "b": formatUTCShortMonth,
        "B": formatUTCMonth,
        "c": null,
        "d": formatUTCDayOfMonth,
        "e": formatUTCDayOfMonth,
        "f": formatUTCMicroseconds,
        "g": formatUTCYearISO,
        "G": formatUTCFullYearISO,
        "H": formatUTCHour24,
        "I": formatUTCHour12,
        "j": formatUTCDayOfYear,
        "L": formatUTCMilliseconds,
        "m": formatUTCMonthNumber,
        "M": formatUTCMinutes,
        "p": formatUTCPeriod,
        "q": formatUTCQuarter,
        "Q": formatUnixTimestamp,
        "s": formatUnixTimestampSeconds,
        "S": formatUTCSeconds,
        "u": formatUTCWeekdayNumberMonday,
        "U": formatUTCWeekNumberSunday,
        "V": formatUTCWeekNumberISO,
        "w": formatUTCWeekdayNumberSunday,
        "W": formatUTCWeekNumberMonday,
        "x": null,
        "X": null,
        "y": formatUTCYear,
        "Y": formatUTCFullYear,
        "Z": formatUTCZone,
        "%": formatLiteralPercent
      };

      var parses = {
        "a": parseShortWeekday,
        "A": parseWeekday,
        "b": parseShortMonth,
        "B": parseMonth,
        "c": parseLocaleDateTime,
        "d": parseDayOfMonth,
        "e": parseDayOfMonth,
        "f": parseMicroseconds,
        "g": parseYear,
        "G": parseFullYear,
        "H": parseHour24,
        "I": parseHour24,
        "j": parseDayOfYear,
        "L": parseMilliseconds,
        "m": parseMonthNumber,
        "M": parseMinutes,
        "p": parsePeriod,
        "q": parseQuarter,
        "Q": parseUnixTimestamp,
        "s": parseUnixTimestampSeconds,
        "S": parseSeconds,
        "u": parseWeekdayNumberMonday,
        "U": parseWeekNumberSunday,
        "V": parseWeekNumberISO,
        "w": parseWeekdayNumberSunday,
        "W": parseWeekNumberMonday,
        "x": parseLocaleDate,
        "X": parseLocaleTime,
        "y": parseYear,
        "Y": parseFullYear,
        "Z": parseZone,
        "%": parseLiteralPercent
      };

      // These recursive directive definitions must be deferred.
      formats.x = newFormat(locale_date, formats);
      formats.X = newFormat(locale_time, formats);
      formats.c = newFormat(locale_dateTime, formats);
      utcFormats.x = newFormat(locale_date, utcFormats);
      utcFormats.X = newFormat(locale_time, utcFormats);
      utcFormats.c = newFormat(locale_dateTime, utcFormats);

      function newFormat(specifier, formats) {
        return function(date) {
          var string = [],
              i = -1,
              j = 0,
              n = specifier.length,
              c,
              pad,
              format;

          if (!(date instanceof Date)) date = new Date(+date);

          while (++i < n) {
            if (specifier.charCodeAt(i) === 37) {
              string.push(specifier.slice(j, i));
              if ((pad = pads[c = specifier.charAt(++i)]) != null) c = specifier.charAt(++i);
              else pad = c === "e" ? " " : "0";
              if (format = formats[c]) c = format(date, pad);
              string.push(c);
              j = i + 1;
            }
          }

          string.push(specifier.slice(j, i));
          return string.join("");
        };
      }

      function newParse(specifier, Z) {
        return function(string) {
          var d = newDate(1900, undefined, 1),
              i = parseSpecifier(d, specifier, string += "", 0),
              week, day$1;
          if (i != string.length) return null;

          // If a UNIX timestamp is specified, return it.
          if ("Q" in d) return new Date(d.Q);
          if ("s" in d) return new Date(d.s * 1000 + ("L" in d ? d.L : 0));

          // If this is utcParse, never use the local timezone.
          if (Z && !("Z" in d)) d.Z = 0;

          // The am-pm flag is 0 for AM, and 1 for PM.
          if ("p" in d) d.H = d.H % 12 + d.p * 12;

          // If the month was not specified, inherit from the quarter.
          if (d.m === undefined) d.m = "q" in d ? d.q : 0;

          // Convert day-of-week and week-of-year to day-of-year.
          if ("V" in d) {
            if (d.V < 1 || d.V > 53) return null;
            if (!("w" in d)) d.w = 1;
            if ("Z" in d) {
              week = utcDate(newDate(d.y, 0, 1)), day$1 = week.getUTCDay();
              week = day$1 > 4 || day$1 === 0 ? utcMonday.ceil(week) : utcMonday(week);
              week = utcDay.offset(week, (d.V - 1) * 7);
              d.y = week.getUTCFullYear();
              d.m = week.getUTCMonth();
              d.d = week.getUTCDate() + (d.w + 6) % 7;
            } else {
              week = localDate(newDate(d.y, 0, 1)), day$1 = week.getDay();
              week = day$1 > 4 || day$1 === 0 ? monday.ceil(week) : monday(week);
              week = day.offset(week, (d.V - 1) * 7);
              d.y = week.getFullYear();
              d.m = week.getMonth();
              d.d = week.getDate() + (d.w + 6) % 7;
            }
          } else if ("W" in d || "U" in d) {
            if (!("w" in d)) d.w = "u" in d ? d.u % 7 : "W" in d ? 1 : 0;
            day$1 = "Z" in d ? utcDate(newDate(d.y, 0, 1)).getUTCDay() : localDate(newDate(d.y, 0, 1)).getDay();
            d.m = 0;
            d.d = "W" in d ? (d.w + 6) % 7 + d.W * 7 - (day$1 + 5) % 7 : d.w + d.U * 7 - (day$1 + 6) % 7;
          }

          // If a time zone is specified, all fields are interpreted as UTC and then
          // offset according to the specified time zone.
          if ("Z" in d) {
            d.H += d.Z / 100 | 0;
            d.M += d.Z % 100;
            return utcDate(d);
          }

          // Otherwise, all fields are in local time.
          return localDate(d);
        };
      }

      function parseSpecifier(d, specifier, string, j) {
        var i = 0,
            n = specifier.length,
            m = string.length,
            c,
            parse;

        while (i < n) {
          if (j >= m) return -1;
          c = specifier.charCodeAt(i++);
          if (c === 37) {
            c = specifier.charAt(i++);
            parse = parses[c in pads ? specifier.charAt(i++) : c];
            if (!parse || ((j = parse(d, string, j)) < 0)) return -1;
          } else if (c != string.charCodeAt(j++)) {
            return -1;
          }
        }

        return j;
      }

      function parsePeriod(d, string, i) {
        var n = periodRe.exec(string.slice(i));
        return n ? (d.p = periodLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
      }

      function parseShortWeekday(d, string, i) {
        var n = shortWeekdayRe.exec(string.slice(i));
        return n ? (d.w = shortWeekdayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
      }

      function parseWeekday(d, string, i) {
        var n = weekdayRe.exec(string.slice(i));
        return n ? (d.w = weekdayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
      }

      function parseShortMonth(d, string, i) {
        var n = shortMonthRe.exec(string.slice(i));
        return n ? (d.m = shortMonthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
      }

      function parseMonth(d, string, i) {
        var n = monthRe.exec(string.slice(i));
        return n ? (d.m = monthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
      }

      function parseLocaleDateTime(d, string, i) {
        return parseSpecifier(d, locale_dateTime, string, i);
      }

      function parseLocaleDate(d, string, i) {
        return parseSpecifier(d, locale_date, string, i);
      }

      function parseLocaleTime(d, string, i) {
        return parseSpecifier(d, locale_time, string, i);
      }

      function formatShortWeekday(d) {
        return locale_shortWeekdays[d.getDay()];
      }

      function formatWeekday(d) {
        return locale_weekdays[d.getDay()];
      }

      function formatShortMonth(d) {
        return locale_shortMonths[d.getMonth()];
      }

      function formatMonth(d) {
        return locale_months[d.getMonth()];
      }

      function formatPeriod(d) {
        return locale_periods[+(d.getHours() >= 12)];
      }

      function formatQuarter(d) {
        return 1 + ~~(d.getMonth() / 3);
      }

      function formatUTCShortWeekday(d) {
        return locale_shortWeekdays[d.getUTCDay()];
      }

      function formatUTCWeekday(d) {
        return locale_weekdays[d.getUTCDay()];
      }

      function formatUTCShortMonth(d) {
        return locale_shortMonths[d.getUTCMonth()];
      }

      function formatUTCMonth(d) {
        return locale_months[d.getUTCMonth()];
      }

      function formatUTCPeriod(d) {
        return locale_periods[+(d.getUTCHours() >= 12)];
      }

      function formatUTCQuarter(d) {
        return 1 + ~~(d.getUTCMonth() / 3);
      }

      return {
        format: function(specifier) {
          var f = newFormat(specifier += "", formats);
          f.toString = function() { return specifier; };
          return f;
        },
        parse: function(specifier) {
          var p = newParse(specifier += "", false);
          p.toString = function() { return specifier; };
          return p;
        },
        utcFormat: function(specifier) {
          var f = newFormat(specifier += "", utcFormats);
          f.toString = function() { return specifier; };
          return f;
        },
        utcParse: function(specifier) {
          var p = newParse(specifier += "", true);
          p.toString = function() { return specifier; };
          return p;
        }
      };
    }

    var pads = {"-": "", "_": " ", "0": "0"},
        numberRe = /^\s*\d+/, // note: ignores next directive
        percentRe = /^%/,
        requoteRe = /[\\^$*+?|[\]().{}]/g;

    function pad(value, fill, width) {
      var sign = value < 0 ? "-" : "",
          string = (sign ? -value : value) + "",
          length = string.length;
      return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
    }

    function requote(s) {
      return s.replace(requoteRe, "\\$&");
    }

    function formatRe(names) {
      return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
    }

    function formatLookup(names) {
      return new Map(names.map((name, i) => [name.toLowerCase(), i]));
    }

    function parseWeekdayNumberSunday(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 1));
      return n ? (d.w = +n[0], i + n[0].length) : -1;
    }

    function parseWeekdayNumberMonday(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 1));
      return n ? (d.u = +n[0], i + n[0].length) : -1;
    }

    function parseWeekNumberSunday(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.U = +n[0], i + n[0].length) : -1;
    }

    function parseWeekNumberISO(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.V = +n[0], i + n[0].length) : -1;
    }

    function parseWeekNumberMonday(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.W = +n[0], i + n[0].length) : -1;
    }

    function parseFullYear(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 4));
      return n ? (d.y = +n[0], i + n[0].length) : -1;
    }

    function parseYear(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2000), i + n[0].length) : -1;
    }

    function parseZone(d, string, i) {
      var n = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(string.slice(i, i + 6));
      return n ? (d.Z = n[1] ? 0 : -(n[2] + (n[3] || "00")), i + n[0].length) : -1;
    }

    function parseQuarter(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 1));
      return n ? (d.q = n[0] * 3 - 3, i + n[0].length) : -1;
    }

    function parseMonthNumber(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.m = n[0] - 1, i + n[0].length) : -1;
    }

    function parseDayOfMonth(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.d = +n[0], i + n[0].length) : -1;
    }

    function parseDayOfYear(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 3));
      return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1;
    }

    function parseHour24(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.H = +n[0], i + n[0].length) : -1;
    }

    function parseMinutes(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.M = +n[0], i + n[0].length) : -1;
    }

    function parseSeconds(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.S = +n[0], i + n[0].length) : -1;
    }

    function parseMilliseconds(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 3));
      return n ? (d.L = +n[0], i + n[0].length) : -1;
    }

    function parseMicroseconds(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 6));
      return n ? (d.L = Math.floor(n[0] / 1000), i + n[0].length) : -1;
    }

    function parseLiteralPercent(d, string, i) {
      var n = percentRe.exec(string.slice(i, i + 1));
      return n ? i + n[0].length : -1;
    }

    function parseUnixTimestamp(d, string, i) {
      var n = numberRe.exec(string.slice(i));
      return n ? (d.Q = +n[0], i + n[0].length) : -1;
    }

    function parseUnixTimestampSeconds(d, string, i) {
      var n = numberRe.exec(string.slice(i));
      return n ? (d.s = +n[0], i + n[0].length) : -1;
    }

    function formatDayOfMonth(d, p) {
      return pad(d.getDate(), p, 2);
    }

    function formatHour24(d, p) {
      return pad(d.getHours(), p, 2);
    }

    function formatHour12(d, p) {
      return pad(d.getHours() % 12 || 12, p, 2);
    }

    function formatDayOfYear(d, p) {
      return pad(1 + day.count(year(d), d), p, 3);
    }

    function formatMilliseconds(d, p) {
      return pad(d.getMilliseconds(), p, 3);
    }

    function formatMicroseconds(d, p) {
      return formatMilliseconds(d, p) + "000";
    }

    function formatMonthNumber(d, p) {
      return pad(d.getMonth() + 1, p, 2);
    }

    function formatMinutes(d, p) {
      return pad(d.getMinutes(), p, 2);
    }

    function formatSeconds(d, p) {
      return pad(d.getSeconds(), p, 2);
    }

    function formatWeekdayNumberMonday(d) {
      var day = d.getDay();
      return day === 0 ? 7 : day;
    }

    function formatWeekNumberSunday(d, p) {
      return pad(sunday.count(year(d) - 1, d), p, 2);
    }

    function dISO(d) {
      var day = d.getDay();
      return (day >= 4 || day === 0) ? thursday(d) : thursday.ceil(d);
    }

    function formatWeekNumberISO(d, p) {
      d = dISO(d);
      return pad(thursday.count(year(d), d) + (year(d).getDay() === 4), p, 2);
    }

    function formatWeekdayNumberSunday(d) {
      return d.getDay();
    }

    function formatWeekNumberMonday(d, p) {
      return pad(monday.count(year(d) - 1, d), p, 2);
    }

    function formatYear(d, p) {
      return pad(d.getFullYear() % 100, p, 2);
    }

    function formatYearISO(d, p) {
      d = dISO(d);
      return pad(d.getFullYear() % 100, p, 2);
    }

    function formatFullYear(d, p) {
      return pad(d.getFullYear() % 10000, p, 4);
    }

    function formatFullYearISO(d, p) {
      var day = d.getDay();
      d = (day >= 4 || day === 0) ? thursday(d) : thursday.ceil(d);
      return pad(d.getFullYear() % 10000, p, 4);
    }

    function formatZone(d) {
      var z = d.getTimezoneOffset();
      return (z > 0 ? "-" : (z *= -1, "+"))
          + pad(z / 60 | 0, "0", 2)
          + pad(z % 60, "0", 2);
    }

    function formatUTCDayOfMonth(d, p) {
      return pad(d.getUTCDate(), p, 2);
    }

    function formatUTCHour24(d, p) {
      return pad(d.getUTCHours(), p, 2);
    }

    function formatUTCHour12(d, p) {
      return pad(d.getUTCHours() % 12 || 12, p, 2);
    }

    function formatUTCDayOfYear(d, p) {
      return pad(1 + utcDay.count(utcYear(d), d), p, 3);
    }

    function formatUTCMilliseconds(d, p) {
      return pad(d.getUTCMilliseconds(), p, 3);
    }

    function formatUTCMicroseconds(d, p) {
      return formatUTCMilliseconds(d, p) + "000";
    }

    function formatUTCMonthNumber(d, p) {
      return pad(d.getUTCMonth() + 1, p, 2);
    }

    function formatUTCMinutes(d, p) {
      return pad(d.getUTCMinutes(), p, 2);
    }

    function formatUTCSeconds(d, p) {
      return pad(d.getUTCSeconds(), p, 2);
    }

    function formatUTCWeekdayNumberMonday(d) {
      var dow = d.getUTCDay();
      return dow === 0 ? 7 : dow;
    }

    function formatUTCWeekNumberSunday(d, p) {
      return pad(utcSunday.count(utcYear(d) - 1, d), p, 2);
    }

    function UTCdISO(d) {
      var day = d.getUTCDay();
      return (day >= 4 || day === 0) ? utcThursday(d) : utcThursday.ceil(d);
    }

    function formatUTCWeekNumberISO(d, p) {
      d = UTCdISO(d);
      return pad(utcThursday.count(utcYear(d), d) + (utcYear(d).getUTCDay() === 4), p, 2);
    }

    function formatUTCWeekdayNumberSunday(d) {
      return d.getUTCDay();
    }

    function formatUTCWeekNumberMonday(d, p) {
      return pad(utcMonday.count(utcYear(d) - 1, d), p, 2);
    }

    function formatUTCYear(d, p) {
      return pad(d.getUTCFullYear() % 100, p, 2);
    }

    function formatUTCYearISO(d, p) {
      d = UTCdISO(d);
      return pad(d.getUTCFullYear() % 100, p, 2);
    }

    function formatUTCFullYear(d, p) {
      return pad(d.getUTCFullYear() % 10000, p, 4);
    }

    function formatUTCFullYearISO(d, p) {
      var day = d.getUTCDay();
      d = (day >= 4 || day === 0) ? utcThursday(d) : utcThursday.ceil(d);
      return pad(d.getUTCFullYear() % 10000, p, 4);
    }

    function formatUTCZone() {
      return "+0000";
    }

    function formatLiteralPercent() {
      return "%";
    }

    function formatUnixTimestamp(d) {
      return +d;
    }

    function formatUnixTimestampSeconds(d) {
      return Math.floor(+d / 1000);
    }

    var locale;
    var timeFormat;
    var timeParse;
    var utcFormat;
    var utcParse;

    defaultLocale({
      dateTime: "%x, %X",
      date: "%-m/%-d/%Y",
      time: "%-I:%M:%S %p",
      periods: ["AM", "PM"],
      days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    });

    function defaultLocale(definition) {
      locale = formatLocale(definition);
      timeFormat = locale.format;
      timeParse = locale.parse;
      utcFormat = locale.utcFormat;
      utcParse = locale.utcParse;
      return locale;
    }

    var isoSpecifier = "%Y-%m-%dT%H:%M:%S.%LZ";

    function formatIsoNative(date) {
      return date.toISOString();
    }

    var formatIso = Date.prototype.toISOString
        ? formatIsoNative
        : utcFormat(isoSpecifier);

    function parseIsoNative(string) {
      var date = new Date(string);
      return isNaN(date) ? null : date;
    }

    var parseIso = +new Date("2000-01-01T00:00:00.000Z")
        ? parseIsoNative
        : utcParse(isoSpecifier);

    var src = /*#__PURE__*/Object.freeze({
        __proto__: null,
        timeFormatDefaultLocale: defaultLocale,
        get timeFormat () { return timeFormat; },
        get timeParse () { return timeParse; },
        get utcFormat () { return utcFormat; },
        get utcParse () { return utcParse; },
        timeFormatLocale: formatLocale,
        isoFormat: formatIso,
        isoParse: parseIso
    });

    function getAugmentedNamespace(n) {
    	if (n.__esModule) return n;
    	var a = Object.defineProperty({}, '__esModule', {value: true});
    	Object.keys(n).forEach(function (k) {
    		var d = Object.getOwnPropertyDescriptor(n, k);
    		Object.defineProperty(a, k, d.get ? d : {
    			enumerable: true,
    			get: function () {
    				return n[k];
    			}
    		});
    	});
    	return a;
    }

    var d3Format = /*@__PURE__*/getAugmentedNamespace(src$1);

    var d3TimeFormat = /*@__PURE__*/getAugmentedNamespace(src);

    var decimal = ",";
    var thousands = ".";
    var grouping = [
    	3
    ];
    var currency = [
    	"",
    	" €"
    ];
    var deFormat = {
    	decimal: decimal,
    	thousands: thousands,
    	grouping: grouping,
    	currency: currency
    };

    var dateTime = "%A, der %e. %B %Y, %X";
    var date = "%d.%m.%Y";
    var time = "%H:%M:%S";
    var periods = [
    	"AM",
    	"PM"
    ];
    var days = [
    	"Sonntag",
    	"Montag",
    	"Dienstag",
    	"Mittwoch",
    	"Donnerstag",
    	"Freitag",
    	"Samstag"
    ];
    var shortDays = [
    	"So",
    	"Mo",
    	"Di",
    	"Mi",
    	"Do",
    	"Fr",
    	"Sa"
    ];
    var months = [
    	"Januar",
    	"Februar",
    	"März",
    	"April",
    	"Mai",
    	"Juni",
    	"Juli",
    	"August",
    	"September",
    	"Oktober",
    	"November",
    	"Dezember"
    ];
    var shortMonths = [
    	"Jan",
    	"Feb",
    	"Mrz",
    	"Apr",
    	"Mai",
    	"Jun",
    	"Jul",
    	"Aug",
    	"Sep",
    	"Okt",
    	"Nov",
    	"Dez"
    ];
    var deTimeFormat = {
    	dateTime: dateTime,
    	date: date,
    	time: time,
    	periods: periods,
    	days: days,
    	shortDays: shortDays,
    	months: months,
    	shortMonths: shortMonths
    };

    var decimal$1 = ".";
    var thousands$1 = ",";
    var grouping$1 = [
    	3
    ];
    var currency$1 = [
    	"$",
    	""
    ];
    var enFormat = {
    	decimal: decimal$1,
    	thousands: thousands$1,
    	grouping: grouping$1,
    	currency: currency$1
    };

    var dateTime$1 = "%x, %X";
    var date$1 = "%-m/%-d/%Y";
    var time$1 = "%-I:%M:%S %p";
    var periods$1 = [
    	"AM",
    	"PM"
    ];
    var days$1 = [
    	"Sunday",
    	"Monday",
    	"Tuesday",
    	"Wednesday",
    	"Thursday",
    	"Friday",
    	"Saturday"
    ];
    var shortDays$1 = [
    	"Sun",
    	"Mon",
    	"Tue",
    	"Wed",
    	"Thu",
    	"Fri",
    	"Sat"
    ];
    var months$1 = [
    	"January",
    	"February",
    	"March",
    	"April",
    	"May",
    	"June",
    	"July",
    	"August",
    	"September",
    	"October",
    	"November",
    	"December"
    ];
    var shortMonths$1 = [
    	"Jan",
    	"Feb",
    	"Mar",
    	"Apr",
    	"May",
    	"Jun",
    	"Jul",
    	"Aug",
    	"Sep",
    	"Oct",
    	"Nov",
    	"Dec"
    ];
    var enTimeFormat = {
    	dateTime: dateTime$1,
    	date: date$1,
    	time: time$1,
    	periods: periods$1,
    	days: days$1,
    	shortDays: shortDays$1,
    	months: months$1,
    	shortMonths: shortMonths$1
    };

    var decimal$2 = ",";
    var thousands$2 = ".";
    var grouping$2 = [
    	3
    ];
    var currency$2 = [
    	"",
    	" €"
    ];
    var esFormat = {
    	decimal: decimal$2,
    	thousands: thousands$2,
    	grouping: grouping$2,
    	currency: currency$2
    };

    var dateTime$2 = "%A, %e de %B de %Y, %X";
    var date$2 = "%d/%m/%Y";
    var time$2 = "%H:%M:%S";
    var periods$2 = [
    	"AM",
    	"PM"
    ];
    var days$2 = [
    	"domingo",
    	"lunes",
    	"martes",
    	"miércoles",
    	"jueves",
    	"viernes",
    	"sábado"
    ];
    var shortDays$2 = [
    	"dom",
    	"lun",
    	"mar",
    	"mié",
    	"jue",
    	"vie",
    	"sáb"
    ];
    var months$2 = [
    	"enero",
    	"febrero",
    	"marzo",
    	"abril",
    	"mayo",
    	"junio",
    	"julio",
    	"agosto",
    	"septiembre",
    	"octubre",
    	"noviembre",
    	"diciembre"
    ];
    var shortMonths$2 = [
    	"ene",
    	"feb",
    	"mar",
    	"abr",
    	"may",
    	"jun",
    	"jul",
    	"ago",
    	"sep",
    	"oct",
    	"nov",
    	"dic"
    ];
    var esTimeFormat = {
    	dateTime: dateTime$2,
    	date: date$2,
    	time: time$2,
    	periods: periods$2,
    	days: days$2,
    	shortDays: shortDays$2,
    	months: months$2,
    	shortMonths: shortMonths$2
    };

    var decimal$3 = ",";
    var thousands$3 = " ";
    var grouping$3 = [
    	3
    ];
    var currency$3 = [
    	"",
    	" €"
    ];
    var percent = " %";
    var frFormat = {
    	decimal: decimal$3,
    	thousands: thousands$3,
    	grouping: grouping$3,
    	currency: currency$3,
    	percent: percent
    };

    var dateTime$3 = "%A %e %B %Y à %X";
    var date$3 = "%d/%m/%Y";
    var time$3 = "%H:%M:%S";
    var periods$3 = [
    	"AM",
    	"PM"
    ];
    var days$3 = [
    	"dimanche",
    	"lundi",
    	"mardi",
    	"mercredi",
    	"jeudi",
    	"vendredi",
    	"samedi"
    ];
    var shortDays$3 = [
    	"dim.",
    	"lun.",
    	"mar.",
    	"mer.",
    	"jeu.",
    	"ven.",
    	"sam."
    ];
    var months$3 = [
    	"janvier",
    	"février",
    	"mars",
    	"avril",
    	"mai",
    	"juin",
    	"juillet",
    	"août",
    	"septembre",
    	"octobre",
    	"novembre",
    	"décembre"
    ];
    var shortMonths$3 = [
    	"janv.",
    	"févr.",
    	"mars",
    	"avr.",
    	"mai",
    	"juin",
    	"juil.",
    	"août",
    	"sept.",
    	"oct.",
    	"nov.",
    	"déc."
    ];
    var frTimeFormat = {
    	dateTime: dateTime$3,
    	date: date$3,
    	time: time$3,
    	periods: periods$3,
    	days: days$3,
    	shortDays: shortDays$3,
    	months: months$3,
    	shortMonths: shortMonths$3
    };

    var decimal$4 = ",";
    var thousands$4 = ".";
    var grouping$4 = [
    	3
    ];
    var currency$4 = [
    	"€",
    	""
    ];
    var itFormat = {
    	decimal: decimal$4,
    	thousands: thousands$4,
    	grouping: grouping$4,
    	currency: currency$4
    };

    var dateTime$4 = "%A %e %B %Y, %X";
    var date$4 = "%d/%m/%Y";
    var time$4 = "%H:%M:%S";
    var periods$4 = [
    	"AM",
    	"PM"
    ];
    var days$4 = [
    	"Domenica",
    	"Lunedì",
    	"Martedì",
    	"Mercoledì",
    	"Giovedì",
    	"Venerdì",
    	"Sabato"
    ];
    var shortDays$4 = [
    	"Dom",
    	"Lun",
    	"Mar",
    	"Mer",
    	"Gio",
    	"Ven",
    	"Sab"
    ];
    var months$4 = [
    	"Gennaio",
    	"Febbraio",
    	"Marzo",
    	"Aprile",
    	"Maggio",
    	"Giugno",
    	"Luglio",
    	"Agosto",
    	"Settembre",
    	"Ottobre",
    	"Novembre",
    	"Dicembre"
    ];
    var shortMonths$4 = [
    	"Gen",
    	"Feb",
    	"Mar",
    	"Apr",
    	"Mag",
    	"Giu",
    	"Lug",
    	"Ago",
    	"Set",
    	"Ott",
    	"Nov",
    	"Dic"
    ];
    var itTimeFormat = {
    	dateTime: dateTime$4,
    	date: date$4,
    	time: time$4,
    	periods: periods$4,
    	days: days$4,
    	shortDays: shortDays$4,
    	months: months$4,
    	shortMonths: shortMonths$4
    };

    var decimal$5 = ".";
    var thousands$5 = ",";
    var grouping$5 = [
    	3
    ];
    var currency$5 = [
    	"",
    	"円"
    ];
    var jaFormat = {
    	decimal: decimal$5,
    	thousands: thousands$5,
    	grouping: grouping$5,
    	currency: currency$5
    };

    var dateTime$5 = "%x %a %X";
    var date$5 = "%Y/%m/%d";
    var time$5 = "%H:%M:%S";
    var periods$5 = [
    	"AM",
    	"PM"
    ];
    var days$5 = [
    	"日曜日",
    	"月曜日",
    	"火曜日",
    	"水曜日",
    	"木曜日",
    	"金曜日",
    	"土曜日"
    ];
    var shortDays$5 = [
    	"日",
    	"月",
    	"火",
    	"水",
    	"木",
    	"金",
    	"土"
    ];
    var months$5 = [
    	"1月",
    	"2月",
    	"3月",
    	"4月",
    	"5月",
    	"6月",
    	"7月",
    	"8月",
    	"9月",
    	"10月",
    	"11月",
    	"12月"
    ];
    var shortMonths$5 = [
    	"1月",
    	"2月",
    	"3月",
    	"4月",
    	"5月",
    	"6月",
    	"7月",
    	"8月",
    	"9月",
    	"10月",
    	"11月",
    	"12月"
    ];
    var jaTimeFormat = {
    	dateTime: dateTime$5,
    	date: date$5,
    	time: time$5,
    	periods: periods$5,
    	days: days$5,
    	shortDays: shortDays$5,
    	months: months$5,
    	shortMonths: shortMonths$5
    };

    const symbols = ['万', '億', '兆', '京', '垓', '𥝱', '穣', '溝', '澗', '正', '載', '極'];
    const groupings = [1e4, 1e8, 1e12, 1e16, 1e20, 1e24, 1e28, 1e32, 1e36, 1e40, 1e44, 1e48];
    symbols.reverse();
    groupings.reverse();

    var myriadFormatter = (localeInstance) => {
      const format = localeInstance.formatLocale.format;
      const { currency } = localeInstance.formatSpecifier;

      const formatMyriad = (parsedNumber, formatter, includesCurrency) => {
        const divisors = groupings.filter(d => d <= parsedNumber);
        let formattedNumber = '';
        let subtraction = 0;
        for (const i in divisors) {
          const divisor = divisors[i];
          const symbol = symbols.slice(-divisors.length)[i];
          const remainder = (parsedNumber - subtraction) / divisor;
          if (remainder === 0) break;
          const number = Math.floor(remainder);
          formattedNumber += `${number}${symbol}`;
          subtraction += number * divisor;
        }
        if (parsedNumber - subtraction > 0) formattedNumber += (parsedNumber - subtraction);
        return includesCurrency ? currency[0] + formattedNumber + currency[1] : formattedNumber;
      };

      return (formatSpecifier) => {
        if (!formatSpecifier.includes('s')) return format(formatSpecifier);
        const includesCurrency = formatSpecifier.includes('$');
        formatSpecifier = formatSpecifier.replace('~s', '').replace('s', '').replace('$', '');
        return (number) => {
          if (number < 1e4) return format(formatSpecifier)(number);
          // We format and parse to handle significant digits formatters, like .2
          const formattedNumber = format(formatSpecifier)(number);
          const parsedNumber = parseFloat(formattedNumber.replace(/,/g, ''));

          return formatMyriad(parsedNumber, format(formatSpecifier), includesCurrency);
        };
      };
    };

    var decimal$6 = ",";
    var thousands$6 = ".";
    var grouping$6 = [
    	3
    ];
    var currency$6 = [
    	"R$",
    	""
    ];
    var ptFormat = {
    	decimal: decimal$6,
    	thousands: thousands$6,
    	grouping: grouping$6,
    	currency: currency$6
    };

    var dateTime$6 = "%A, %e de %B de %Y. %X";
    var date$6 = "%d/%m/%Y";
    var time$6 = "%H:%M:%S";
    var periods$6 = [
    	"AM",
    	"PM"
    ];
    var days$6 = [
    	"Domingo",
    	"Segunda",
    	"Terça",
    	"Quarta",
    	"Quinta",
    	"Sexta",
    	"Sábado"
    ];
    var shortDays$6 = [
    	"Dom",
    	"Seg",
    	"Ter",
    	"Qua",
    	"Qui",
    	"Sex",
    	"Sáb"
    ];
    var months$6 = [
    	"Janeiro",
    	"Fevereiro",
    	"Março",
    	"Abril",
    	"Maio",
    	"Junho",
    	"Julho",
    	"Agosto",
    	"Setembro",
    	"Outubro",
    	"Novembro",
    	"Dezembro"
    ];
    var shortMonths$6 = [
    	"Jan",
    	"Fev",
    	"Mar",
    	"Abr",
    	"Mai",
    	"Jun",
    	"Jul",
    	"Ago",
    	"Set",
    	"Out",
    	"Nov",
    	"Dez"
    ];
    var ptTimeFormat = {
    	dateTime: dateTime$6,
    	date: date$6,
    	time: time$6,
    	periods: periods$6,
    	days: days$6,
    	shortDays: shortDays$6,
    	months: months$6,
    	shortMonths: shortMonths$6
    };

    var decimal$7 = ".";
    var thousands$7 = ",";
    var grouping$7 = [
    	3
    ];
    var currency$7 = [
    	"¥",
    	""
    ];
    var zhFormat = {
    	decimal: decimal$7,
    	thousands: thousands$7,
    	grouping: grouping$7,
    	currency: currency$7
    };

    var dateTime$7 = "%x %A %X";
    var date$7 = "%Y年%-m月%-d日";
    var time$7 = "%H:%M:%S";
    var periods$7 = [
    	"上午",
    	"下午"
    ];
    var days$7 = [
    	"星期日",
    	"星期一",
    	"星期二",
    	"星期三",
    	"星期四",
    	"星期五",
    	"星期六"
    ];
    var shortDays$7 = [
    	"周日",
    	"周一",
    	"周二",
    	"周三",
    	"周四",
    	"周五",
    	"周六"
    ];
    var months$7 = [
    	"一月",
    	"二月",
    	"三月",
    	"四月",
    	"五月",
    	"六月",
    	"七月",
    	"八月",
    	"九月",
    	"十月",
    	"十一月",
    	"十二月"
    ];
    var shortMonths$7 = [
    	"一月",
    	"二月",
    	"三月",
    	"四月",
    	"五月",
    	"六月",
    	"七月",
    	"八月",
    	"九月",
    	"十月",
    	"十一月",
    	"十二月"
    ];
    var zhTimeFormat = {
    	dateTime: dateTime$7,
    	date: date$7,
    	time: time$7,
    	periods: periods$7,
    	days: days$7,
    	shortDays: shortDays$7,
    	months: months$7,
    	shortMonths: shortMonths$7
    };

    class D3Locale {
      constructor(locale = 'en') {
        this._locale = locale;
        this._formatSpecifier = {};
        this._timeFormatSpecifier = {};
        this._apStyleDates = false;
      }

      get locale() {
        return this._locale;
      }

      set locale(locale) {
        this._locale = locale;
      }

      get formatSpecifier() {
        switch (this._locale) {
          case 'es':
            return { ...esFormat, ...this._formatSpecifier };
          case 'de':
            return { ...deFormat, ...this._formatSpecifier };
          case 'fr':
            return { ...frFormat, ...this._formatSpecifier };
          case 'it':
            return { ...itFormat, ...this._formatSpecifier };
          case 'ja':
            return { ...jaFormat, ...this._formatSpecifier };
          case 'pt':
            return { ...ptFormat, ...this._formatSpecifier };
          case 'zh':
            return { ...zhFormat, ...this._formatSpecifier };
          default:
            return { ...enFormat, ...this._formatSpecifier };
        }
      }

      set formatSpecifier(specifier) {
        this._formatSpecifier = specifier;
      }

      get formatLocale() {
        return d3Format.formatLocale(this.formatSpecifier);
      }

      get format() {
        // Special casing for Japanese/Chinese myriads
        if (
          this.locale === 'ja' ||
          this.locale === 'zh'
        ) return myriadFormatter(this);
        return this.formatLocale.format;
      }

      get timeFormatSpecifier() {
        switch (this._locale) {
          case 'es':
            return { ...esTimeFormat, ...this._timeFormatSpecifier };
          case 'de':
            return { ...deTimeFormat, ...this._timeFormatSpecifier };
          case 'fr':
            return { ...frTimeFormat, ...this._timeFormatSpecifier };
          case 'it':
            return { ...itTimeFormat, ...this._timeFormatSpecifier };
          case 'ja':
            return { ...jaTimeFormat, ...this._timeFormatSpecifier };
          case 'pt':
            return { ...ptTimeFormat, ...this._timeFormatSpecifier };
          case 'zh':
            return { ...zhTimeFormat, ...this._timeFormatSpecifier };
          default:
            return { ...enTimeFormat, ...this._timeFormatSpecifier };
        }
      }

      set timeFormatSpecifier(specifier) {
        this._timeFormatSpecifier = specifier;
      }

      get timeFormatLocale() {
        return d3TimeFormat.timeFormatLocale(this.timeFormatSpecifier);
      }

      get formatTime() {
        return this.timeFormatLocale.format;
      }

      apStyle() {
        if (this._locale !== 'en') return;
        this._timeFormatSpecifier = {
          ...this._timeFormatSpecifier,
          ...{
            shortMonths: ['Jan.', 'Feb.', 'March', 'April', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'],
          },
        };
      }
    }

    var dist = D3Locale;

    /* src/components/text/FlyP.svelte generated by Svelte v3.38.2 */
    const file$4 = "src/components/text/FlyP.svelte";

    // (8:4) {#if p.illo}
    function create_if_block$3(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "small-image svelte-trtkon");
    			set_style(img, "transform", "translate(" + (/*intersecting*/ ctx[2] ? 0 : 10) + "%, 0)");
    			set_style(img, "opacity", /*intersecting*/ ctx[2] ? 1 : 0);
    			if (img.src !== (img_src_value = "img/" + /*p*/ ctx[0].illo + ".png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Abstract watercolor as an illustration for the the text below");
    			add_location(img, file$4, 8, 4, 269);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*intersecting*/ 4) {
    				set_style(img, "transform", "translate(" + (/*intersecting*/ ctx[2] ? 0 : 10) + "%, 0)");
    			}

    			if (dirty & /*intersecting*/ 4) {
    				set_style(img, "opacity", /*intersecting*/ ctx[2] ? 1 : 0);
    			}

    			if (dirty & /*p*/ 1 && img.src !== (img_src_value = "img/" + /*p*/ ctx[0].illo + ".png")) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(8:4) {#if p.illo}",
    		ctx
    	});

    	return block;
    }

    // (7:2) <IntersectionObserver {element} on:observe="{(e) => {intersecting = e.detail.isIntersecting;}}" threshold=.5>
    function create_default_slot(ctx) {
    	let t;
    	let p_1;
    	let raw_value = /*p*/ ctx[0].p + "";
    	let if_block = /*p*/ ctx[0].illo && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			p_1 = element("p");
    			set_style(p_1, "transform", "translate(" + (/*intersecting*/ ctx[2] ? 0 : -10) + "%, 0)");
    			set_style(p_1, "opacity", /*intersecting*/ ctx[2] ? 1 : 0);
    			attr_dev(p_1, "class", "svelte-trtkon");
    			add_location(p_1, file$4, 10, 4, 489);
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, p_1, anchor);
    			p_1.innerHTML = raw_value;
    			/*p_1_binding*/ ctx[3](p_1);
    		},
    		p: function update(ctx, dirty) {
    			if (/*p*/ ctx[0].illo) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*p*/ 1 && raw_value !== (raw_value = /*p*/ ctx[0].p + "")) p_1.innerHTML = raw_value;
    			if (dirty & /*intersecting*/ 4) {
    				set_style(p_1, "transform", "translate(" + (/*intersecting*/ ctx[2] ? 0 : -10) + "%, 0)");
    			}

    			if (dirty & /*intersecting*/ 4) {
    				set_style(p_1, "opacity", /*intersecting*/ ctx[2] ? 1 : 0);
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(p_1);
    			/*p_1_binding*/ ctx[3](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(7:2) <IntersectionObserver {element} on:observe=\\\"{(e) => {intersecting = e.detail.isIntersecting;}}\\\" threshold=.5>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let intersectionobserver;
    	let current;

    	intersectionobserver = new IntersectionObserver_1({
    			props: {
    				element: /*element*/ ctx[1],
    				threshold: ".5",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	intersectionobserver.$on("observe", /*observe_handler*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(intersectionobserver.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(intersectionobserver, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const intersectionobserver_changes = {};
    			if (dirty & /*element*/ 2) intersectionobserver_changes.element = /*element*/ ctx[1];

    			if (dirty & /*$$scope, intersecting, element, p*/ 39) {
    				intersectionobserver_changes.$$scope = { dirty, ctx };
    			}

    			intersectionobserver.$set(intersectionobserver_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(intersectionobserver.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(intersectionobserver.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(intersectionobserver, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FlyP", slots, []);
    	let { p } = $$props;
    	let element, intersecting;
    	const writable_props = ["p"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FlyP> was created with unknown prop '${key}'`);
    	});

    	function p_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(1, element);
    		});
    	}

    	const observe_handler = e => {
    		$$invalidate(2, intersecting = e.detail.isIntersecting);
    	};

    	$$self.$$set = $$props => {
    		if ("p" in $$props) $$invalidate(0, p = $$props.p);
    	};

    	$$self.$capture_state = () => ({
    		IntersectionObserver: IntersectionObserver_1,
    		p,
    		element,
    		intersecting
    	});

    	$$self.$inject_state = $$props => {
    		if ("p" in $$props) $$invalidate(0, p = $$props.p);
    		if ("element" in $$props) $$invalidate(1, element = $$props.element);
    		if ("intersecting" in $$props) $$invalidate(2, intersecting = $$props.intersecting);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [p, element, intersecting, p_1_binding, observe_handler];
    }

    class FlyP extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { p: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FlyP",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*p*/ ctx[0] === undefined && !("p" in props)) {
    			console.warn("<FlyP> was created without expected prop 'p'");
    		}
    	}

    	get p() {
    		throw new Error("<FlyP>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set p(value) {
    		throw new Error("<FlyP>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/text/BigText.svelte generated by Svelte v3.38.2 */
    const file$3 = "src/components/text/BigText.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (9:4) {#if text}
    function create_if_block$2(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*text*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text*/ 1) {
    				each_value = /*text*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(9:4) {#if text}",
    		ctx
    	});

    	return block;
    }

    // (10:4) {#each text as p}
    function create_each_block$2(ctx) {
    	let flyp;
    	let current;

    	flyp = new FlyP({
    			props: { p: /*p*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(flyp.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(flyp, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const flyp_changes = {};
    			if (dirty & /*text*/ 1) flyp_changes.p = /*p*/ ctx[1];
    			flyp.$set(flyp_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(flyp.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(flyp.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(flyp, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(10:4) {#each text as p}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let section;
    	let div;
    	let current;
    	let if_block = /*text*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "big-text-wrapper");
    			add_location(div, file$3, 7, 4, 110);
    			attr_dev(section, "class", "col-text");
    			add_location(section, file$3, 6, 0, 79);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*text*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*text*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("BigText", slots, []);
    	let { text } = $$props;
    	const writable_props = ["text"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BigText> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    	};

    	$$self.$capture_state = () => ({ FlyP, text });

    	$$self.$inject_state = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text];
    }

    class BigText extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { text: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BigText",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*text*/ ctx[0] === undefined && !("text" in props)) {
    			console.warn("<BigText> was created without expected prop 'text'");
    		}
    	}

    	get text() {
    		throw new Error("<BigText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<BigText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/img/SmallImage.svelte generated by Svelte v3.38.2 */

    const file$2 = "src/components/img/SmallImage.svelte";

    function create_fragment$2(ctx) {
    	let section;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			section = element("section");
    			img = element("img");
    			attr_dev(img, "class", "small-image svelte-15f97bs");
    			if (img.src !== (img_src_value = "./img/" + /*illo*/ ctx[0] + ".png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Abstract watercolor illustration");
    			add_location(img, file$2, 15, 0, 371);
    			attr_dev(section, "class", "full-width");
    			attr_dev(section, "style", /*margin*/ ctx[1]());
    			add_location(section, file$2, 14, 0, 325);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, img);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*illo*/ 1 && img.src !== (img_src_value = "./img/" + /*illo*/ ctx[0] + ".png")) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SmallImage", slots, []);
    	let { illo } = $$props;
    	let { align } = $$props;

    	const margin = () => {
    		switch (align) {
    			case "left":
    				return "text-align:left";
    			case "right":
    				return "text-align:right";
    			case "center":
    				return "text-align:center";
    		}
    	};

    	const writable_props = ["illo", "align"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SmallImage> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("illo" in $$props) $$invalidate(0, illo = $$props.illo);
    		if ("align" in $$props) $$invalidate(2, align = $$props.align);
    	};

    	$$self.$capture_state = () => ({ illo, align, margin });

    	$$self.$inject_state = $$props => {
    		if ("illo" in $$props) $$invalidate(0, illo = $$props.illo);
    		if ("align" in $$props) $$invalidate(2, align = $$props.align);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [illo, margin, align];
    }

    class SmallImage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { illo: 0, align: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SmallImage",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*illo*/ ctx[0] === undefined && !("illo" in props)) {
    			console.warn("<SmallImage> was created without expected prop 'illo'");
    		}

    		if (/*align*/ ctx[2] === undefined && !("align" in props)) {
    			console.warn("<SmallImage> was created without expected prop 'align'");
    		}
    	}

    	get illo() {
    		throw new Error("<SmallImage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set illo(value) {
    		throw new Error("<SmallImage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get align() {
    		throw new Error("<SmallImage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set align(value) {
    		throw new Error("<SmallImage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/text/Download.svelte generated by Svelte v3.38.2 */

    const file$1 = "src/components/text/Download.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (15:2) {#if resources}
    function create_if_block$1(ctx) {
    	let h4;
    	let t;
    	let ul;
    	let each_value = /*resources*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			t = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h4, file$1, 15, 2, 384);
    			attr_dev(ul, "class", "svelte-14qriv2");
    			add_location(ul, file$1, 16, 2, 409);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			h4.innerHTML = /*other*/ ctx[3];
    			insert_dev(target, t, anchor);
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*other*/ 8) h4.innerHTML = /*other*/ ctx[3];
    			if (dirty & /*resources*/ 4) {
    				each_value = /*resources*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(15:2) {#if resources}",
    		ctx
    	});

    	return block;
    }

    // (18:4) {#each resources as r}
    function create_each_block$1(ctx) {
    	let li;
    	let a;
    	let t_value = /*r*/ ctx[7].label + "";
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", a_href_value = "./graphics/" + /*r*/ ctx[7].link);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$1, 18, 22, 463);
    			attr_dev(li, "class", "label svelte-14qriv2");
    			add_location(li, file$1, 18, 4, 445);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*resources*/ 4 && t_value !== (t_value = /*r*/ ctx[7].label + "")) set_data_dev(t, t_value);

    			if (dirty & /*resources*/ 4 && a_href_value !== (a_href_value = "./graphics/" + /*r*/ ctx[7].link)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(18:4) {#each resources as r}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let section1;
    	let a0;
    	let img;
    	let img_src_value;
    	let t0;
    	let h40;
    	let a1;
    	let t1;
    	let section0;
    	let t2;
    	let h41;
    	let a2;
    	let if_block = /*resources*/ ctx[2] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			section1 = element("section");
    			a0 = element("a");
    			img = element("img");
    			t0 = space();
    			h40 = element("h4");
    			a1 = element("a");
    			t1 = space();
    			section0 = element("section");
    			if (if_block) if_block.c();
    			t2 = space();
    			h41 = element("h4");
    			a2 = element("a");
    			if (img.src !== (img_src_value = "./img/" + /*cover*/ ctx[1] + ".png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Cover of the report");
    			attr_dev(img, "class", "svelte-14qriv2");
    			add_location(img, file$1, 11, 42, 240);
    			attr_dev(a0, "class", "img_link svelte-14qriv2");
    			attr_dev(a0, "href", /*downloadlink*/ ctx[4]);
    			add_location(a0, file$1, 11, 2, 200);
    			attr_dev(a1, "href", /*downloadlink*/ ctx[4]);
    			add_location(a1, file$1, 12, 6, 307);
    			add_location(h40, file$1, 12, 2, 303);
    			attr_dev(a2, "href", /*furtherlink*/ ctx[6]);
    			add_location(a2, file$1, 22, 6, 562);
    			add_location(h41, file$1, 22, 2, 558);
    			add_location(section0, file$1, 13, 2, 354);
    			attr_dev(section1, "class", "col-text border svelte-14qriv2");
    			add_location(section1, file$1, 10, 0, 164);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section1, anchor);
    			append_dev(section1, a0);
    			append_dev(a0, img);
    			append_dev(section1, t0);
    			append_dev(section1, h40);
    			append_dev(h40, a1);
    			a1.innerHTML = /*head*/ ctx[0];
    			append_dev(section1, t1);
    			append_dev(section1, section0);
    			if (if_block) if_block.m(section0, null);
    			append_dev(section0, t2);
    			append_dev(section0, h41);
    			append_dev(h41, a2);
    			a2.innerHTML = /*further*/ ctx[5];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*cover*/ 2 && img.src !== (img_src_value = "./img/" + /*cover*/ ctx[1] + ".png")) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*downloadlink*/ 16) {
    				attr_dev(a0, "href", /*downloadlink*/ ctx[4]);
    			}

    			if (dirty & /*head*/ 1) a1.innerHTML = /*head*/ ctx[0];
    			if (dirty & /*downloadlink*/ 16) {
    				attr_dev(a1, "href", /*downloadlink*/ ctx[4]);
    			}

    			if (/*resources*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(section0, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*further*/ 32) a2.innerHTML = /*further*/ ctx[5];
    			if (dirty & /*furtherlink*/ 64) {
    				attr_dev(a2, "href", /*furtherlink*/ ctx[6]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section1);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Download", slots, []);
    	let { head } = $$props;
    	let { cover } = $$props;
    	let { resources } = $$props;
    	let { other } = $$props;
    	let { downloadlink } = $$props;
    	let { further } = $$props;
    	let { furtherlink } = $$props;

    	const writable_props = [
    		"head",
    		"cover",
    		"resources",
    		"other",
    		"downloadlink",
    		"further",
    		"furtherlink"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Download> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("head" in $$props) $$invalidate(0, head = $$props.head);
    		if ("cover" in $$props) $$invalidate(1, cover = $$props.cover);
    		if ("resources" in $$props) $$invalidate(2, resources = $$props.resources);
    		if ("other" in $$props) $$invalidate(3, other = $$props.other);
    		if ("downloadlink" in $$props) $$invalidate(4, downloadlink = $$props.downloadlink);
    		if ("further" in $$props) $$invalidate(5, further = $$props.further);
    		if ("furtherlink" in $$props) $$invalidate(6, furtherlink = $$props.furtherlink);
    	};

    	$$self.$capture_state = () => ({
    		head,
    		cover,
    		resources,
    		other,
    		downloadlink,
    		further,
    		furtherlink
    	});

    	$$self.$inject_state = $$props => {
    		if ("head" in $$props) $$invalidate(0, head = $$props.head);
    		if ("cover" in $$props) $$invalidate(1, cover = $$props.cover);
    		if ("resources" in $$props) $$invalidate(2, resources = $$props.resources);
    		if ("other" in $$props) $$invalidate(3, other = $$props.other);
    		if ("downloadlink" in $$props) $$invalidate(4, downloadlink = $$props.downloadlink);
    		if ("further" in $$props) $$invalidate(5, further = $$props.further);
    		if ("furtherlink" in $$props) $$invalidate(6, furtherlink = $$props.furtherlink);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [head, cover, resources, other, downloadlink, further, furtherlink];
    }

    class Download extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			head: 0,
    			cover: 1,
    			resources: 2,
    			other: 3,
    			downloadlink: 4,
    			further: 5,
    			furtherlink: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Download",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*head*/ ctx[0] === undefined && !("head" in props)) {
    			console.warn("<Download> was created without expected prop 'head'");
    		}

    		if (/*cover*/ ctx[1] === undefined && !("cover" in props)) {
    			console.warn("<Download> was created without expected prop 'cover'");
    		}

    		if (/*resources*/ ctx[2] === undefined && !("resources" in props)) {
    			console.warn("<Download> was created without expected prop 'resources'");
    		}

    		if (/*other*/ ctx[3] === undefined && !("other" in props)) {
    			console.warn("<Download> was created without expected prop 'other'");
    		}

    		if (/*downloadlink*/ ctx[4] === undefined && !("downloadlink" in props)) {
    			console.warn("<Download> was created without expected prop 'downloadlink'");
    		}

    		if (/*further*/ ctx[5] === undefined && !("further" in props)) {
    			console.warn("<Download> was created without expected prop 'further'");
    		}

    		if (/*furtherlink*/ ctx[6] === undefined && !("furtherlink" in props)) {
    			console.warn("<Download> was created without expected prop 'furtherlink'");
    		}
    	}

    	get head() {
    		throw new Error("<Download>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set head(value) {
    		throw new Error("<Download>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cover() {
    		throw new Error("<Download>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cover(value) {
    		throw new Error("<Download>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get resources() {
    		throw new Error("<Download>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set resources(value) {
    		throw new Error("<Download>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get other() {
    		throw new Error("<Download>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set other(value) {
    		throw new Error("<Download>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get downloadlink() {
    		throw new Error("<Download>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set downloadlink(value) {
    		throw new Error("<Download>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get further() {
    		throw new Error("<Download>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set further(value) {
    		throw new Error("<Download>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get furtherlink() {
    		throw new Error("<Download>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set furtherlink(value) {
    		throw new Error("<Download>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.38.2 */
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (52:5) {:else}
    function create_else_block(ctx) {
    	let text_1;
    	let current;
    	const text_1_spread_levels = [/*block*/ ctx[7]];
    	let text_1_props = {};

    	for (let i = 0; i < text_1_spread_levels.length; i += 1) {
    		text_1_props = assign(text_1_props, text_1_spread_levels[i]);
    	}

    	text_1 = new Text({ props: text_1_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(text_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(text_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const text_1_changes = (dirty & /*content*/ 1)
    			? get_spread_update(text_1_spread_levels, [get_spread_object(/*block*/ ctx[7])])
    			: {};

    			text_1.$set(text_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(text_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(text_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(text_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(52:5) {:else}",
    		ctx
    	});

    	return block;
    }

    // (50:38) 
    function create_if_block_10(ctx) {
    	let download;
    	let current;
    	const download_spread_levels = [/*block*/ ctx[7]];
    	let download_props = {};

    	for (let i = 0; i < download_spread_levels.length; i += 1) {
    		download_props = assign(download_props, download_spread_levels[i]);
    	}

    	download = new Download({ props: download_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(download.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(download, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const download_changes = (dirty & /*content*/ 1)
    			? get_spread_update(download_spread_levels, [get_spread_object(/*block*/ ctx[7])])
    			: {};

    			download.$set(download_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(download.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(download.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(download, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(50:38) ",
    		ctx
    	});

    	return block;
    }

    // (48:36) 
    function create_if_block_9(ctx) {
    	let footer;
    	let current;
    	const footer_spread_levels = [/*block*/ ctx[7]];
    	let footer_props = {};

    	for (let i = 0; i < footer_spread_levels.length; i += 1) {
    		footer_props = assign(footer_props, footer_spread_levels[i]);
    	}

    	footer = new Footer({ props: footer_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(footer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const footer_changes = (dirty & /*content*/ 1)
    			? get_spread_update(footer_spread_levels, [get_spread_object(/*block*/ ctx[7])])
    			: {};

    			footer.$set(footer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(48:36) ",
    		ctx
    	});

    	return block;
    }

    // (46:40) 
    function create_if_block_8(ctx) {
    	let smallimage;
    	let current;
    	const smallimage_spread_levels = [/*block*/ ctx[7]];
    	let smallimage_props = {};

    	for (let i = 0; i < smallimage_spread_levels.length; i += 1) {
    		smallimage_props = assign(smallimage_props, smallimage_spread_levels[i]);
    	}

    	smallimage = new SmallImage({ props: smallimage_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(smallimage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(smallimage, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const smallimage_changes = (dirty & /*content*/ 1)
    			? get_spread_update(smallimage_spread_levels, [get_spread_object(/*block*/ ctx[7])])
    			: {};

    			smallimage.$set(smallimage_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(smallimage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(smallimage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(smallimage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(46:40) ",
    		ctx
    	});

    	return block;
    }

    // (44:38) 
    function create_if_block_7(ctx) {
    	let bigtext;
    	let current;
    	const bigtext_spread_levels = [/*block*/ ctx[7]];
    	let bigtext_props = {};

    	for (let i = 0; i < bigtext_spread_levels.length; i += 1) {
    		bigtext_props = assign(bigtext_props, bigtext_spread_levels[i]);
    	}

    	bigtext = new BigText({ props: bigtext_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(bigtext.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(bigtext, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const bigtext_changes = (dirty & /*content*/ 1)
    			? get_spread_update(bigtext_spread_levels, [get_spread_object(/*block*/ ctx[7])])
    			: {};

    			bigtext.$set(bigtext_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(bigtext.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(bigtext.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(bigtext, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(44:38) ",
    		ctx
    	});

    	return block;
    }

    // (42:43) 
    function create_if_block_6(ctx) {
    	let scrollerdiagram;
    	let current;

    	const scrollerdiagram_spread_levels = [
    		/*block*/ ctx[7],
    		{ src: "video/" + /*block*/ ctx[7].video },
    		{
    			bg: /*block*/ ctx[7].video === "litter" ? "white" : ""
    		}
    	];

    	let scrollerdiagram_props = {};

    	for (let i = 0; i < scrollerdiagram_spread_levels.length; i += 1) {
    		scrollerdiagram_props = assign(scrollerdiagram_props, scrollerdiagram_spread_levels[i]);
    	}

    	scrollerdiagram = new ScrollerDiagram({
    			props: scrollerdiagram_props,
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(scrollerdiagram.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(scrollerdiagram, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const scrollerdiagram_changes = (dirty & /*content*/ 1)
    			? get_spread_update(scrollerdiagram_spread_levels, [
    					get_spread_object(/*block*/ ctx[7]),
    					{ src: "video/" + /*block*/ ctx[7].video },
    					{
    						bg: /*block*/ ctx[7].video === "litter" ? "white" : ""
    					}
    				])
    			: {};

    			scrollerdiagram.$set(scrollerdiagram_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(scrollerdiagram.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(scrollerdiagram.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(scrollerdiagram, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(42:43) ",
    		ctx
    	});

    	return block;
    }

    // (40:42) 
    function create_if_block_5(ctx) {
    	let scrollerbigtext;
    	let current;
    	const scrollerbigtext_spread_levels = [/*block*/ ctx[7], { src: "video/" + /*block*/ ctx[7].video }];
    	let scrollerbigtext_props = {};

    	for (let i = 0; i < scrollerbigtext_spread_levels.length; i += 1) {
    		scrollerbigtext_props = assign(scrollerbigtext_props, scrollerbigtext_spread_levels[i]);
    	}

    	scrollerbigtext = new ScrollerBigText({
    			props: scrollerbigtext_props,
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(scrollerbigtext.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(scrollerbigtext, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const scrollerbigtext_changes = (dirty & /*content*/ 1)
    			? get_spread_update(scrollerbigtext_spread_levels, [
    					get_spread_object(/*block*/ ctx[7]),
    					{ src: "video/" + /*block*/ ctx[7].video }
    				])
    			: {};

    			scrollerbigtext.$set(scrollerbigtext_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(scrollerbigtext.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(scrollerbigtext.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(scrollerbigtext, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(40:42) ",
    		ctx
    	});

    	return block;
    }

    // (38:37) 
    function create_if_block_4(ctx) {
    	let scrollergallery;
    	let current;
    	const scrollergallery_spread_levels = [/*block*/ ctx[7]];
    	let scrollergallery_props = {};

    	for (let i = 0; i < scrollergallery_spread_levels.length; i += 1) {
    		scrollergallery_props = assign(scrollergallery_props, scrollergallery_spread_levels[i]);
    	}

    	scrollergallery = new ScrollerGallery({
    			props: scrollergallery_props,
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(scrollergallery.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(scrollergallery, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const scrollergallery_changes = (dirty & /*content*/ 1)
    			? get_spread_update(scrollergallery_spread_levels, [get_spread_object(/*block*/ ctx[7])])
    			: {};

    			scrollergallery.$set(scrollergallery_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(scrollergallery.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(scrollergallery.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(scrollergallery, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(38:37) ",
    		ctx
    	});

    	return block;
    }

    // (36:34) 
    function create_if_block_3(ctx) {
    	let illo;
    	let current;
    	const illo_spread_levels = [/*block*/ ctx[7]];
    	let illo_props = {};

    	for (let i = 0; i < illo_spread_levels.length; i += 1) {
    		illo_props = assign(illo_props, illo_spread_levels[i]);
    	}

    	illo = new Illo({ props: illo_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(illo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(illo, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const illo_changes = (dirty & /*content*/ 1)
    			? get_spread_update(illo_spread_levels, [get_spread_object(/*block*/ ctx[7])])
    			: {};

    			illo.$set(illo_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(illo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(illo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(illo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(36:34) ",
    		ctx
    	});

    	return block;
    }

    // (34:34) 
    function create_if_block_2(ctx) {
    	let pill;
    	let current;
    	const pill_spread_levels = [/*block*/ ctx[7]];
    	let pill_props = {};

    	for (let i = 0; i < pill_spread_levels.length; i += 1) {
    		pill_props = assign(pill_props, pill_spread_levels[i]);
    	}

    	pill = new Pill({ props: pill_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(pill.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(pill, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const pill_changes = (dirty & /*content*/ 1)
    			? get_spread_update(pill_spread_levels, [get_spread_object(/*block*/ ctx[7])])
    			: {};

    			pill.$set(pill_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pill.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pill.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(pill, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(34:34) ",
    		ctx
    	});

    	return block;
    }

    // (32:36) 
    function create_if_block_1(ctx) {
    	let intro_1;
    	let current;
    	const intro_1_spread_levels = [/*block*/ ctx[7], { lang: /*lang*/ ctx[2] }];
    	let intro_1_props = {};

    	for (let i = 0; i < intro_1_spread_levels.length; i += 1) {
    		intro_1_props = assign(intro_1_props, intro_1_spread_levels[i]);
    	}

    	intro_1 = new Intro({ props: intro_1_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(intro_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(intro_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const intro_1_changes = (dirty & /*content, lang*/ 5)
    			? get_spread_update(intro_1_spread_levels, [
    					dirty & /*content*/ 1 && get_spread_object(/*block*/ ctx[7]),
    					dirty & /*lang*/ 4 && { lang: /*lang*/ ctx[2] }
    				])
    			: {};

    			intro_1.$set(intro_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(intro_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(intro_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(intro_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(32:36) ",
    		ctx
    	});

    	return block;
    }

    // (30:2) {#if block.type === 'header' || block.type === 'intro'}
    function create_if_block(ctx) {
    	let chapterheader;
    	let current;
    	const chapterheader_spread_levels = [/*block*/ ctx[7]];
    	let chapterheader_props = {};

    	for (let i = 0; i < chapterheader_spread_levels.length; i += 1) {
    		chapterheader_props = assign(chapterheader_props, chapterheader_spread_levels[i]);
    	}

    	chapterheader = new ChapterHeader({
    			props: chapterheader_props,
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(chapterheader.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(chapterheader, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const chapterheader_changes = (dirty & /*content*/ 1)
    			? get_spread_update(chapterheader_spread_levels, [get_spread_object(/*block*/ ctx[7])])
    			: {};

    			chapterheader.$set(chapterheader_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(chapterheader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(chapterheader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(chapterheader, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(30:2) {#if block.type === 'header' || block.type === 'intro'}",
    		ctx
    	});

    	return block;
    }

    // (29:4) {#each content as block}
    function create_each_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;

    	const if_block_creators = [
    		create_if_block,
    		create_if_block_1,
    		create_if_block_2,
    		create_if_block_3,
    		create_if_block_4,
    		create_if_block_5,
    		create_if_block_6,
    		create_if_block_7,
    		create_if_block_8,
    		create_if_block_9,
    		create_if_block_10,
    		create_else_block
    	];

    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*block*/ ctx[7].type === "header" || /*block*/ ctx[7].type === "intro") return 0;
    		if (/*block*/ ctx[7].type === "series") return 1;
    		if (/*block*/ ctx[7].type === "pill") return 2;
    		if (/*block*/ ctx[7].type === "illo") return 3;
    		if (/*block*/ ctx[7].type === "gallery") return 4;
    		if (/*block*/ ctx[7].type === "scrolly-data") return 5;
    		if (/*block*/ ctx[7].type === "scrolly-video") return 6;
    		if (/*block*/ ctx[7].type === "big-text") return 7;
    		if (/*block*/ ctx[7].type === "small-illo") return 8;
    		if (/*block*/ ctx[7].type === "footer") return 9;
    		if (/*block*/ ctx[7].type === "download") return 10;
    		return 11;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(29:4) {#each content as block}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let topnav;
    	let t;
    	let main;
    	let article;
    	let article_class_value;
    	let article_dir_value;
    	let current;
    	const topnav_spread_levels = [/*menu*/ ctx[1][0], { lang: /*lang*/ ctx[2] }];
    	let topnav_props = {};

    	for (let i = 0; i < topnav_spread_levels.length; i += 1) {
    		topnav_props = assign(topnav_props, topnav_spread_levels[i]);
    	}

    	topnav = new TopNav({ props: topnav_props, $$inline: true });
    	let each_value = /*content*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			create_component(topnav.$$.fragment);
    			t = space();
    			main = element("main");
    			article = element("article");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(article, "class", article_class_value = "" + (null_to_empty(/*lang*/ ctx[2] === "ar" ? "rtl" : "") + " svelte-1vr8qti"));
    			attr_dev(article, "dir", article_dir_value = /*lang*/ ctx[2] === "ar" ? "rtl" : "");
    			add_location(article, file, 27, 2, 1051);
    			attr_dev(main, "class", "svelte-1vr8qti");
    			add_location(main, file, 26, 0, 1042);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(topnav, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, article);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(article, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const topnav_changes = (dirty & /*menu, lang*/ 6)
    			? get_spread_update(topnav_spread_levels, [
    					dirty & /*menu*/ 2 && get_spread_object(/*menu*/ ctx[1][0]),
    					dirty & /*lang*/ 4 && { lang: /*lang*/ ctx[2] }
    				])
    			: {};

    			topnav.$set(topnav_changes);

    			if (dirty & /*content, lang*/ 5) {
    				each_value = /*content*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(article, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*lang*/ 4 && article_class_value !== (article_class_value = "" + (null_to_empty(/*lang*/ ctx[2] === "ar" ? "rtl" : "") + " svelte-1vr8qti"))) {
    				attr_dev(article, "class", article_class_value);
    			}

    			if (!current || dirty & /*lang*/ 4 && article_dir_value !== (article_dir_value = /*lang*/ ctx[2] === "ar" ? "rtl" : "")) {
    				attr_dev(article, "dir", article_dir_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(topnav.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(topnav.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(topnav, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	let { content } = $$props,
    		{ intro } = $$props,
    		{ meta } = $$props,
    		{ menu } = $$props,
    		{ lang } = $$props;

    	const loc = new dist(lang);

    	const format = {
    		x: loc.formatTime("%Y"),
    		y: loc.format(".2%")
    	};

    	const writable_props = ["content", "intro", "meta", "menu", "lang"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("content" in $$props) $$invalidate(0, content = $$props.content);
    		if ("intro" in $$props) $$invalidate(3, intro = $$props.intro);
    		if ("meta" in $$props) $$invalidate(4, meta = $$props.meta);
    		if ("menu" in $$props) $$invalidate(1, menu = $$props.menu);
    		if ("lang" in $$props) $$invalidate(2, lang = $$props.lang);
    	};

    	$$self.$capture_state = () => ({
    		Intro,
    		Text,
    		Footer,
    		ChapterHeader,
    		ScrollerGallery,
    		ScrollerBigText,
    		Illo,
    		TopNav,
    		ScrollerDiagram,
    		Pill,
    		locale: dist,
    		BigText,
    		SmallImage,
    		Download,
    		content,
    		intro,
    		meta,
    		menu,
    		lang,
    		loc,
    		format
    	});

    	$$self.$inject_state = $$props => {
    		if ("content" in $$props) $$invalidate(0, content = $$props.content);
    		if ("intro" in $$props) $$invalidate(3, intro = $$props.intro);
    		if ("meta" in $$props) $$invalidate(4, meta = $$props.meta);
    		if ("menu" in $$props) $$invalidate(1, menu = $$props.menu);
    		if ("lang" in $$props) $$invalidate(2, lang = $$props.lang);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [content, menu, lang, intro, meta];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			content: 0,
    			intro: 3,
    			meta: 4,
    			menu: 1,
    			lang: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*content*/ ctx[0] === undefined && !("content" in props)) {
    			console.warn("<App> was created without expected prop 'content'");
    		}

    		if (/*intro*/ ctx[3] === undefined && !("intro" in props)) {
    			console.warn("<App> was created without expected prop 'intro'");
    		}

    		if (/*meta*/ ctx[4] === undefined && !("meta" in props)) {
    			console.warn("<App> was created without expected prop 'meta'");
    		}

    		if (/*menu*/ ctx[1] === undefined && !("menu" in props)) {
    			console.warn("<App> was created without expected prop 'menu'");
    		}

    		if (/*lang*/ ctx[2] === undefined && !("lang" in props)) {
    			console.warn("<App> was created without expected prop 'lang'");
    		}
    	}

    	get content() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set content(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get intro() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set intro(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get meta() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set meta(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get menu() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set menu(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lang() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lang(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var article$8 = [
    	{
    		type: "intro",
    		head: "From Pollution<br/> <b>to Solution</b>",
    		video: "intro",
    		text: [
    			{
    				p: "What do the deepest point in the ocean, <b>the Mariana trench</b>, and the highest mountain peak in the world, <b>Mt. Everest, have in common</b>?"
    			},
    			{
    				p: "Despite being among the planet's most remote and inaccessible environments, <b>they both contain tiny pieces of plastic from human activities</b> miles away."
    			},
    			{
    				p: "<b>Plastics</b> are the largest, most harmful and persistent fraction of marine litter, accounting for at least <b>85 per cent of total marine waste</b>."
    			},
    			{
    				p: "Marine litter is found in <b>increasing volumes</b> along our coastlines and estuaries, in massive swirling mid-ocean currents, on remote islands, in sea ice ..."
    			},
    			{
    				p: "… across the sea floor from the polar regions down into the deepest darkest trenches, <b>harming marine life</b> and damaging habitats across its path."
    			}
    		]
    	},
    	{
    		type: "series",
    		tag: "This story is part of a series from UNEP that showcases how humanity can live more in harmony with nature on a pollution-free and climate-stable planet.",
    		kicker: "More stories from the series",
    		stories: [
    			{
    				item: "Life Below Water",
    				link: "https://www.unep.org/interactive/status-world-coral-reefs/"
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Over the last 70 years, plastic - an incredibly malleable, versatile, and durable material - infiltrated the market and permeated seemingly every nook and cranny on Earth. Plastics can provide important benefits, from life-saving medical devices to safe and long-life food storage. However, unnecessary and avoidable plastics, particularly single-use packaging and disposable items, are polluting our planet at alarming rates. Decades of economic growth and an increasing dependency on throw-away plastic products has led to a torrent of unmanaged waste that pours into lakes, rivers, coastal environments, and finally out to sea, triggering a ripple of problems."
    			},
    			{
    				p: "<strong><a href=\"\">From Pollution to Solution: a global assessment of marine litter and plastic pollution</a></strong> shows that there is a growing threat in all ecosystems from source to sea. It also shows that while we have the know-how, we need the political will and urgent action by governments to tackle the mounting crisis. The report will inform priority actions at the UN Environment Assembly (UNEA 5.2) in 2022, where countries will come together to decide a way forward for global cooperation. The new UN Assessment warns that unless we get a handle on our plastics problem:"
    			}
    		]
    	},
    	{
    		type: "scrolly-video",
    		video: "litter",
    		text: [
    			{
    				p: "Without urgent action, the estimated 11 million metric tons of plastic currently entering the ocean annually will triple in the next twenty years."
    			},
    			{
    				p: "This would mean between 23 and 37 million metric tons of plastic flowing into the ocean every year by 2040."
    			},
    			{
    				p: "That is equivalent to 50 kilograms of plastics per metre of coastline worldwide …"
    			},
    			{
    				p: "… or the weight of as many as 178 Symphony of the Seas, the largest cruise ship in the world."
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "The problem has burgeoned into a global crisis requiring both immediate and sustained attention and action. This assessment provides the definitive wake-up call to the ubiquity of marine litter and the adverse impacts of plastic pollution – from environmental degradation to economic losses for communities and industries, to human health risks – and shows us how we can do better. It’s time to join hands to turn the tide on marine litter and plastic pollution by implementing the many – great and small – solutions at hand, with urgency, innovation, commitment and accountability."
    			}
    		]
    	},
    	{
    		type: "pill",
    		short: "How small are microplastics and nanoplastics?",
    		long: "Microplastics and nanoplastics are plastic pieces which range from 5 millimeters long to less than a few nanometres long."
    	},
    	{
    		type: "text",
    		head: "Harm to Marine Life",
    		text: [
    			{
    				p: "Marine litter and plastic pollution are problematic for many reasons. Plastics don’t biodegrade (decompose naturally in a way that’s not harmful to the environment). Instead, they break down over time into ever smaller pieces known as microplastics and nanoplastics, which can have significant adverse impacts."
    			},
    			{
    				p: "Impacts to marine life range from physical or chemical harm to individual animals, to wider effects on biodiversity and ecosystem functioning. Pieces of plastic have been found in the digestive system of many aquatic organisms, including in every marine turtle species and nearly half of all surveyed seabird and marine mammal species."
    			}
    		]
    	},
    	{
    		type: "scrolly-video",
    		video: "harm_to_animals",
    		text: [
    			{
    				p: "Sea turtles mistake floating plastic bags for jellyfish, slowly starving as their stomachs fill with indigestible trash."
    			},
    			{
    				p: "Seabirds peck at plastics because it <a href=\"https://www.nature.com/articles/376680a0.epdf?sharing_token=XzA3pMyq1-90bp8IHPsDiNRgN0jAjWel9jnR3ZoTv0NjqwHPzT2EZOmoupSkNogAcZGDea6VHenadcy2ZVTQLAQygdRw7H4UC7py46oKWTeTp_jR-LXk4EUiQD6fCfvgRxa9FeT2BsqDP4gNHAHc1UOJNEfRsAF6L4Fzte3kHmnRcOOaeLbB7-DtdeGWOnUkVs0C8l8RNzNyQal8GyWw8jg93siTVTmEMCZPcazH8Z6Ugd6g-RzwR2_TN5PgL8qQP1k1RCdu4pqP8R7_z_ucaoN-S1AoVv52tqlLZZR6c5k%3D&amp;tracking_referrer=www.scientificamerican.com\">smells and looks like food</a>."
    			},
    			{
    				p: "Marine mammals, sea turtles and other animals often drown after becoming trapped in <a href=\"https://www.fisheries.noaa.gov/alaska/marine-life-distress/pinniped-entanglement-marine-debris\">lost or discarded plastics</a> including packaging or fishing gear."
    			},
    			{
    				p: "A leading cause of death for <a href=\"https://www.fisheries.noaa.gov/species/north-atlantic-right-whale\">North Atlantic right whales</a>, one of the world's most critically endangered whales, is being ensnared in ghost fishing gear."
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "There are less obvious impacts too. Not only do the toxins already found in plastics affect the ocean food web but plastic pieces are known to soak up pollutants that flow off land into the sea, including pharmaceutical and industrial waste. The toxicity can transfer through the food chain as marine species eat and are eaten. There is also a growing concern about non-native species hitching a ride across the ocean on floating trash into foreign seas and soil, such as algae, molluscs and barnacles, which can invade and degrade distant aquatic environments and species.  The problem is compounded by the fact that most plastic garbage in the ocean eventually sinks to the seabed like a submerged trash pile, smothering coral reefs and seafloor marine life below."
    			}
    		]
    	},
    	{
    		type: "illo",
    		illo: "woman"
    	},
    	{
    		type: "text",
    		head: "Harm to Humans",
    		text: [
    			{
    				p: "Humans are also at risk from marine litter and plastic pollution. Environmental health is inextricably linked to human health. The pervasiveness of microplastics across our planet raises serious concerns for people's safety. <a href=\"https://www.acs.org/content/acs/en/pressroom/newsreleases/2020/august/micro-and-nanoplastics-detectable-in-human-tissues.html\">New research</a> shows that people are inhaling microplastics through the air, consuming them through food and water and even absorbing them through the skin. Microplastics have even been found within <strong>our lungs, livers, spleens, and kidneys</strong>, and one study recently found microplastics in <strong>the placentas</strong> of newborn babies."
    			},
    			{
    				p: "The full extent of the impact on human health is still unknown since the research is nascent. There is, however, substantial evidence that plastics-associated chemicals, such as methyl mercury, plasticisers and flame retardants, can enter the body and are linked to health concerns, especially in women. Scientists also believe that some of the common chemicals found in plastics, such as bisphenol A, phthalates, and polychlorinated biphenyls (PCBs), could leach into the body. These chemicals have been linked to endocrine disruption, developmental disorders, reproductive abnormalities and cancer. That’s reason enough for a precautionary approach to be adopted."
    			}
    		]
    	},
    	{
    		type: "pill",
    		short: "China banned the import of most plastic waste",
    		long: "In 2018, China banned the import of most plastic waste to help improve the environment, air quality and economy within its own borders since most of the trash wound up in landfills or in waterways and soil."
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "The impacts of plastic pollution aren’t felt equally around the world. Wealthier countries produce more plastic waste, which all too frequently flows into less developed countries where waste management is the least sophisticated. Recycling can help to reduce plastic production and plastic waste; however, a major problem is the low recycling rate of plastics worldwide, which is currently less than 10 per cent."
    			},
    			{
    				p: "Communities in developing countries are the least capable of managing the environmental, health, social and cultural burden of plastic pollution due to a lack of government support or funds. That means women, children, waste workers, coastal communities, Indigenous Peoples and people who depend on the ocean <a href=\"https://www.unescap.org/sites/default/files/publications/CS76%20Theme%20Study.pdf\">feel the impacts more intensely</a>, particularly when moving or burning mismanaged waste. It also means these economies suffer as they're suffocated by plastics."
    			},
    			{
    				p: "Marine plastics negatively impact the ability of myriad ecosystems to provide the basic benefits that humans both enjoy and take for granted, which range from clean water to productive aquaculture and fisheries, pest and disease control, climate regulation, heritage and recreation. According to the Pollution to Solution Assessment, marine plastics pollution reduces valuable marine ecosystem service by at least US$500 billion to US$2,500 billion each year, and that’s not including other social and economic losses like tourism and shipping."
    			},
    			{
    				p: "The Assessment highlights that the direct economic losses to coastal and maritime industries, such as fisheries and shipping, are significant. In the Mediterranean region, these losses have been estimated at close to US$138 million per year. In the Asia Pacific Economic Cooperation region, the losses total US$10.8 billion, a nearly ten-fold increase compared to 2009. However, these losses aren’t well reported, and the true costs of marine litter and plastic pollution on human, environmental, and social health are still being discovered."
    			}
    		]
    	},
    	{
    		type: "header",
    		head: "Plastics and Climate Change",
    		video: "coral-polluted"
    	},
    	{
    		type: "pill",
    		short: "An off ratio of male and female turtles?",
    		long: "Microplastics can raise the temperature of the sand on beaches where sea turtles nest. Since sand temperature determines the sex of turtles, these warmer nests may alter the ratio of male and female turtles that hatch on these beaches."
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Plastics are also a climate problem. Not everyone knows that plastic is predominantly produced from oil and gas, both of which are fossil fuels. The more plastic we make, the more fossil fuel is required, the more we intensify the climate crisis in a continual negative feedback loop. Also, plastic products create greenhouse gas emissions across their whole lifecycle. If no action is taken, greenhouse gas emissions from the production, recycling and incineration of plastics could account for <a href=\"https://www.pewtrusts.org/-/media/assets/2020/07/breakingtheplasticwave_report.pdf\">19 per cent of the Paris Agreement's total allowable emissions in 2040</a> to limit warming to 1.5 degrees Celsius."
    			},
    			{
    				p: "In recent years, there has been an increased urgency to protect the ocean and seas to tackle climate change. The ocean is the planet's largest carbon sink, storing <a href=\"https://www.climate.gov/news-features/understanding-climate/climate-change-ocean-heat-content\">as much as 90 per cent of the additional heat that carbon emissions have trapped in our atmosphere</a> and one-third of the additional carbon dioxide generated since the industrial revolution. Absorbing large quantities of carbon has slowed the visible impacts of a warming planet – but also accelerated catastrophic effects below the water's surface – a warming, acidifying and chemically imbalanced ocean."
    			},
    			{
    				p: "Carbon is sequestered in every component of the ocean, especially mangroves, seagrass, corals and salt marshes. The more damage we do to our ocean and coastal areas, the harder it is for these ecosystems to both offset and remain resilient to climate change."
    			},
    			{
    				p: "Alarmingly, <a href=\"https://www.sciencedirect.com/science/article/abs/pii/S0048969721002886\">a recent study</a> on marine plastics pollution by GRID-Arendal, a UNEP partner, indicates that the four coastal ecosystems that store the most carbon and serve as natural barriers against rising seas and storms – mangroves, seagrasses, salt marshes and coral reefs – are being put under pressure from land-based plastic pollution as a consequence of their proximity to rivers. More than ever, marine litter surveys and research are essential to predict the consequences of pressures, design mitigation approaches, and guide adaptation."
    			}
    		]
    	},
    	{
    		type: "pill",
    		short: "Healthy mangrove forests",
    		long: "<a href=\"https://www.sciencedaily.com/releases/2011/04/110404173247.htm\">Healthy coastal mangrove forests store more carbon per unit area than almost any other forest on Earth</a>."
    	},
    	{
    		type: "header",
    		head: "From Plastic Pollution to Solution",
    		video: "waste"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Rampant pollution, biodiversity breakdown, and climate instability are the most pressing planetary crises of our time. The rapid growth of plastic production already poses threats to Earth's natural systems, on which life depends, and it's projected to get worse. By 2040, plastic waste is expected to present an annual financial risk of US$100 billion for businesses that would need to bear the costs of waste management at expected volumes. It is estimated that <a href=\"https://www.eionet.europa.eu/etcs/etc-wmge/products/impact-of-covid-19-on-single-use-plastics-and-the-environment-in-europe\" target=\"_blank\">in Italy alone, between 160,000 and 440,000 metric tons of additional waste</a> was  produced in 2020 due to intensified reliance on medical <strong>protective equipment during the Covid-19 pandemic</strong>. If just 1 per cent of the single-use masks that contribute to this figure were improperly disposed of, up to 10 million masks might enter and pollute the ocean per month."
    			},
    			{
    				p: "While the quantity of marine plastics that we need to tackle is so large it's hard to fathom, science tells us that most of the solutions we need already exist. Numerous regional, national, and local activities are helping reduce the flow of plastics into the ocean, such as the Regional Seas Conventions, national bans on single-use plastic products, <a href=\"https://www.ellenmacarthurfoundation.org/news/a-line-in-the-sand-ellen-macarthur-foundation-launch-global-commitment-to-eliminate-plastic-pollution-at-the-source\">business and government</a> commitments to reduce, redesign and reuse plastic products, increase the recycled plastic content in new products, curbside initiatives, and municipal bag bans."
    			},
    			{
    				p: "\"<a href=\"https://www.pewtrusts.org/en/research-and-analysis/articles/2020/07/23/breaking-the-plastic-wave-top-findings\" target=\"_blank\">Breaking the Plastic Wave</a>\", a global analysis of how to change the trajectory of plastic waste, reveals that we can reduce the amount of plastic entering the ocean by about 80 per cent in the next two decades if we utilize existing technologies and solutions."
    			},
    			{
    				p: "Continuing with business-as-usual is simply not an option. The “Pollution to Solution” assessment explains that the scale of the problem requires urgent commitments and action at the global level, across the plastics lifecycle and from source to sea to achieve the necessary long-term reduction of waste."
    			}
    		]
    	},
    	{
    		type: "big-text",
    		text: [
    			{
    				illo: "small-illos-02",
    				p: "Improve waste management systems so that the right infrastructure is available to receive plastic waste and ensure a high proportion can be reused or recycled."
    			},
    			{
    				illo: "small-illos-03",
    				p: "Enhance circularity by promoting more sustainable consumption and production practices across the entire plastic value chain."
    			},
    			{
    				illo: "small-illos-04",
    				p: "Engage consumers in addressing plastic pollution to influence the market and to inspire behavioral change."
    			},
    			{
    				illo: "small-illos-05",
    				p: "Close the tap by phasing out unnecessary, avoidable, and most problematic plastic items and replacing these with alternative materials, products and services."
    			},
    			{
    				illo: "small-illos-06",
    				p: "Deal with the legacy through effective monitoring to identify sources, quantities and the fate of plastics."
    			},
    			{
    				illo: "small-illos-07",
    				p: "Improve and strengthen governance at all levels."
    			},
    			{
    				illo: "small-illos-08",
    				p: "Enhance knowledge and monitor effectiveness using sound science."
    			},
    			{
    				illo: "small-illos-09",
    				p: "Improve finance with technical assistance and capacity building."
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Several existing international agreements and conventions already provide support for reducing marine pollution, combatting climate change (SDG 13), and sustainably using the oceans (SDG 14). The Global Partnership on Marine Litter, the United Nations Convention on the Law of the Sea, and the Convention on Biological Diversity directly relate to the health of the ocean, its ecosystems and marine life. The Basel, Stockholm and Rotterdam conventions relate to the movement and disposal of hazardous waste and chemicals. There is also growing momentum for a potential global agreement on marine litter and plastic pollution to tackle this scourge."
    			},
    			{
    				p: "There is no single solution. As with many intergenerational environmental assaults, this requires systems thinking, innovation and transformation. However, the goal is singular: reduce the use of unnecessary, avoidable and problematic plastics, and stop their flow into our lakes, rivers, wetlands, coasts and seas. We are all in this together, and together, we can, we must solve the marine litter and plastic pollution problem."
    			}
    		]
    	},
    	{
    		type: "download",
    		head: "Download the UNEP report: From Pollution to Solution: a global assessment of marine litter and plastic pollution",
    		cover: "cover",
    		other: "Additional material (infographics)",
    		further: "Further resources",
    		downloadlink: "https://wedocs.unep.org/xmlui/bitstream/handle/20.500.11822/36963/POLSOL.pdf",
    		furtherlink: "https://www.unep.org/resources/pollution-solution-global-assessment-marine-litter-and-plastic-pollution"
    	},
    	{
    		type: "footer",
    		head: "Join UNEP in taking action now!",
    		text: [
    			{
    				p: "<span class=\"subhead\">The <a href=\"https://www.unep.org/environmentassembly/about-united-nations-environment-assembly\">United Nations Environment Assembly</a> (UNEA)</span> is the world's highest-level decision-making body on the environment, with a universal membership of all 193 Member States. The Assembly sets priorities for global environmental policies, develops international environmental law, provides leadership, catalyses intergovernmental action on the environment, and contributes to the implementation of the <a href=\"https://sustainabledevelopment.un.org/\">UN 2030 Agenda for Sustainable Development</a>. This landmark assessment will urge governments at the next UNEA-5.2 in February 2022, to take decisive, global action to address the plastics crisis. Accreditation with the UN Environment Programme will enable you to participate. Organizations are encouraged to send accreditation requests soon so they can be processed in time. Find out more <a href=\"https://www.unep.org/civil-society-engagement/accreditation\">here</a>."
    			},
    			{
    				p: "<span class=\"subhead\">Rooted in the long-standing work of UNEP and the <a href=\"\">Global Partnership on Marine Litter (GPML)</a>, the <a href=\"https://www.cleanseas.org/\">Clean Seas Campaign</a></span> is connecting and rallying individuals, civil society groups, industry and governments to catalyse change and transform habits, practices, standards and policies around the globe to dramatically reduce marine litter and its negative impacts. To date, 63 countries have joined, and over one hundred thousand individuals have engaged with the campaign through pledges of action, commitments and social media interactions. Find out how to join and take the #CleanSeas pledge <a href=\"https://www.cleanseas.org/make-pledge\">here</a>."
    			},
    			{
    				p: "<span class=\"subhead\">The <a href=\"https://www.gpmarinelitter.org/\">Global Partnership on Marine Litter</a> (GPML)</span> brings together all actors working on marine litter and plastic pollution prevention and reduction. All entities working to address this urgent global issue are invited to join the GPML <a href=\"https://www.gpmarinelitter.org/who-we-are/members/sign-up\">here</a>. The GPML Digital Platform is an open-source, multi-stakeholder platform that compiles different resources, connects stakeholders and integrates data to guide action, with the goal of promoting equitable access to data, information, technology and innovation. Discover more and join <a href=\"https://digital.gpmarinelitter.org/\">here</a>!"
    			},
    			{
    				p: "<span class=\"subhead\"><a href=\"https://ellenmacarthurfoundation.org/topics/the-global-commitment/overview\">The New Plastics Economy Global Commitment</a></span> unites businesses, governments, and other organisations along the plastics value chain behind <a href=\"https://emf.thirdlight.com/link/86tanzqdbppx-8rdpns/@/preview/1?o\">a common vision</a> and targets to address plastic waste and pollution at its source. It is led by the <a href=\"https://ellenmacarthurfoundation.org/\">Ellen MacArthur Foundation</a> in collaboration with <a href=\"https://www.unep.org/\">UNEP</a>. Signatories commit to take specific actions to ELIMINATE the plastic we don't need; INNOVATE to ensure that the plastic products we do need are reusable, recyclable or compostable; and CIRCULATE all the plastic items we use to keep them in the economy and out of the environment."
    			},
    			{
    				p: "<span class=\"subhead\">The <a href=\"https://www.oneplanetnetwork.org/sustainable-tourism/global-tourism-plastics-initiative\">Global Tourism Plastics Initiative</a> (GTPI)</span> is the interface of the Global Commitment with the Tourism sector. Over 600 organisations including 20 governments from across the world and over 350 businesses representing more than 20 per cent of the plastic packaging used globally are signatories of the Global Commitment and the GTPI."
    			},
    			{
    				p: "<span class=\"subhead\">The <a href=\"https://www.oneplanetnetwork.org/one-planet-network-wide-plastics-initiative\">One Planet Network-Wide Plastics Initiative</a></span> promotes actions across a common narrative that builds on the evidence and knowledge produced by UNEP, while leveraging the different expertise and partnerships within the programmes of the One Planet network. Plastic packaging at the use-stage of the plastics value chain is the key entry point to frame the network's collective response."
    			}
    		]
    	}
    ];
    var resources$7 = [
    ];
    var menu$9 = [
    	{
    		item: "Download report",
    		short: "Download",
    		link: "https://wedocs.unep.org/xmlui/bitstream/handle/20.500.11822/36963/POLSOL.pdf"
    	}
    ];
    var meta$9 = {
    	title: "From Pollution to Solution",
    	url: "unep.org/interactive/pollution-to-solution",
    	description: "A rigorous assessment of various health, economic, ecosystem, wildlife and climate threats and solutions associated with marine litter and plastic pollution.",
    	keywords: "Plastic on Beaches, Clean Seas, Ocean Pollution, Plastic Pollution, Litter in the Ocean, Plastic Wastes, Sources of Water Pollution"
    };
    var storyEN = {
    	article: article$8,
    	resources: resources$7,
    	menu: menu$9,
    	meta: meta$9
    };

    var article$7 = [
    	{
    		type: "intro",
    		head: "De la contaminación<br/> <b>a la solución</b>",
    		video: "intro",
    		text: [
    			{
    				p: "¿Qué tienen en común el punto más profundo del océano, <b>la fosa de las Marianas</b>, y el pico más alto del mundo, <b>el monte Everest</b>?"
    			},
    			{
    				p: "A pesar de figurar entre los entornos más remotos e inaccesibles del planeta, <b>ambos contienen diminutos trozos de plástico originados a kilómetros de distancia</b> procedentes de las actividades humanas."
    			},
    			{
    				p: "<b>Los plásticos</b> constituyen la fracción más grande, dañina y persistente de la basura marina y representan al menos un <b>85% del total de los desechos que hay en el mar</b>."
    			},
    			{
    				p: "La basura marina se encuentra en <b>volúmenes cada vez mayores</b> a lo largo de nuestras costas y estuarios, en enormes remolinos de las corrientes mesoceánicas, en islas remotas, en los hielos marinos..."
    			},
    			{
    				p: "… en el fondo del océano, desde las regiones polares hasta las fosas más profundas y oscuras, <b>dañando la vida marina</b> y los hábitats a su paso."
    			}
    		]
    	},
    	{
    		type: "series",
    		tag: "Este artículo forma parte de una serie del PNUMA que muestra cómo la humanidad puede vivir en mayor armonía con la naturaleza en un planeta sin contaminación y con un clima estable.",
    		kicker: "Otros artículos de la serie",
    		stories: [
    			{
    				item: "Vida submarina",
    				link: "https://www.unep.org/interactive/status-world-coral-reefs/?lang=ES"
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "En los últimos 70 años, el plástico —un material increíblemente maleable, versátil y duradero— se ha infiltrado en el mercado y todo apunta a que se ha extendido hasta el último rincón de la Tierra. Los plásticos pueden aportar importantes beneficios, desde dispositivos médicos que salvan vidas hasta un almacenamiento seguro y prolongado de alimentos. Sin embargo, los productos que son innecesarios y evitables, especialmente los envases de un solo uso y los artículos desechables, están contaminando nuestro planeta a un ritmo alarmante. Decenios de crecimiento económico y una dependencia cada vez mayor de los productos de plástico de usar y tirar han provocado que haya un torrente de residuos que se quedan sin gestionar y se vierten en lagos, ríos, entornos costeros y, por último, en el mar, lo que desencadena una oleada de problemas."
    			},
    			{
    				p: "<strong><a href=\"\">From Pollution to Solution: a global assessment of marine litter and plastic pollution (\"De la contaminación a la solución: evaluación mundial de la basura marina y la contaminación por plásticos\")</a></strong> muestra que existe una amenaza creciente en todos los ecosistemas, desde el origen hasta el mar. También muestra que, aunque disponemos de los conocimientos técnicos necesarios, para hacer frente a esta creciente crisis hace falta voluntad política y que los gobiernos tomen medidas urgentes. El informe servirá de base para las acciones prioritarias de la Asamblea de las Naciones Unidas sobre el Medio Ambiente (UNEA 5.2) de 2022, en la que los países se reunirán para decidir los próximos pasos en la cooperación mundial. La nueva evaluación de las Naciones Unidas advierte que, a menos que resolvamos nuestro problema con los plásticos:"
    			}
    		]
    	},
    	{
    		type: "scrolly-video",
    		video: "litter",
    		text: [
    			{
    				p: "Si no se toman medidas urgentes, los 11 millones de toneladas métricas de plástico que se calcula que llegan actualmente al océano cada año se triplicarán en los próximos veinte años."
    			},
    			{
    				p: "Esto supondría que en 2040 se verterían cada año a los océanos entre 23 y 37 millones de toneladas métricas de plástico."
    			},
    			{
    				p: "Esto equivale a 50 kilogramos de plástico por metro de costa en todo el globo…"
    			},
    			{
    				p: "… o al peso de hasta 178 Symphony of the Seas, el crucero más grande del mundo."
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "El problema se ha convertido en una crisis mundial que requiere una atención y medidas inmediatas y sostenidas. Esta evaluación es el llamado de alerta definitivo sobre la omnipresencia de la basura marina y los efectos adversos de la contaminación por plásticos —desde la degradación del medio ambiente hasta pérdidas económicas para las comunidades e industrias, pasando por los riesgos para la salud humana— y nos muestra qué podemos hacer para mejorar. Es hora de que nos unamos para cambiar el curso de la basura marina y la contaminación por plásticos mediante la aplicación de las muchas soluciones, grandes y pequeñas, que tenemos a nuestro alcance, con urgencia, innovación, compromiso y responsabilidad."
    			}
    		]
    	},
    	{
    		type: "pill",
    		short: "¿Cómo de pequeños son los microplásticos y los nanoplásticos?",
    		long: "Los microplásticos y nanoplásticos son trozos de plástico cuyo tamaño va desde los 5 milímetros a menos de unos pocos nanómetros."
    	},
    	{
    		type: "text",
    		head: "Los daños a la vida marina",
    		text: [
    			{
    				p: "La basura marina y la contaminación por plásticos son fenómenos problemáticos por muchas razones. Los plásticos no se biodegradan (no se descomponen de forma natural sin dañar el medio ambiente), sino que se van deshaciendo con el tiempo en fragmentos cada vez más pequeños, conocidos como microplásticos y nanoplásticos, que pueden tener importantes efectos adversos."
    			},
    			{
    				p: "Su impacto en la vida marina va desde daños físicos o químicos a animales individuales hasta efectos más extensos sobre la biodiversidad y el funcionamiento de los ecosistemas. Se han encontrado trozos de plástico en el sistema digestivo de muchos organismos acuáticos, incluidas todas las especies de tortugas marinas y casi la mitad de las especies de aves y mamíferos marinos estudiados."
    			}
    		]
    	},
    	{
    		type: "scrolly-video",
    		video: "harm_to_animals",
    		text: [
    			{
    				p: "Las tortugas marinas confunden las bolsas de plástico flotantes con medusas, y mueren de hambre lentamente a medida que van llenando el estómago de basura que no pueden digerir."
    			},
    			{
    				p: "Las aves marinas picotean los plásticos porque <a href=\"https://www.nature.com/articles/376680a0.epdf?sharing_token=XzA3pMyq1-90bp8IHPsDiNRgN0jAjWel9jnR3ZoTv0NjqwHPzT2EZOmoupSkNogAcZGDea6VHenadcy2ZVTQLAQygdRw7H4UC7py46oKWTeTp_jR-LXk4EUiQD6fCfvgRxa9FeT2BsqDP4gNHAHc1UOJNEfRsAF6L4Fzte3kHmnRcOOaeLbB7-DtdeGWOnUkVs0C8l8RNzNyQal8GyWw8jg93siTVTmEMCZPcazH8Z6Ugd6g-RzwR2_TN5PgL8qQP1k1RCdu4pqP8R7_z_ucaoN-S1AoVv52tqlLZZR6c5k%3D&amp;tracking_referrer=www.scientificamerican.com\">huelen a comida y parecen comida</a>."
    			},
    			{
    				p: "Los mamíferos marinos, las tortugas de mar y otros animales suelen ahogarse tras quedar atrapados en <a href=\"https://www.fisheries.noaa.gov/alaska/marine-life-distress/pinniped-entanglement-marine-debris\">plásticos perdidos o desechados,</a> como envases o artes de pesca."
    			},
    			{
    				p: "Una de las principales causas de muerte de las <a href=\"https://www.fisheries.noaa.gov/species/north-atlantic-right-whale\">ballenas francas del Atlántico Norte</a>, una de las especies de ballena en mayor peligro de extinción del mundo, es el atrapamiento en artes de pesca fantasma."
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "También hay otros efectos menos evidentes. No solo es que las toxinas que ya se encuentran en los plásticos afecten a la red trófica de los océanos, sino que también se ha descubierto que los trozos de plástico absorben los contaminantes que fluyen desde la tierra hacia el mar, incluidos los residuos farmacéuticos e industriales. La toxicidad puede transferirse a través de la cadena alimentaria a medida que las especies marinas se comen unas a otras. También existe una creciente preocupación por las especies no autóctonas que atraviesan el océano en la basura flotante hasta llegar a mares y suelos ajenos, como las algas, los moluscos y los percebes, que pueden invadir y degradar especies y entornos acuáticos lejanos. Este problema se agrava por el hecho de que la mayor parte de la basura plástica de los océanos acaba hundiéndose en los fondos marinos y formando montones de basura sumergida, que asfixian a los arrecifes de coral y la vida que hay debajo, en el lecho marino."
    			}
    		]
    	},
    	{
    		type: "illo",
    		illo: "woman"
    	},
    	{
    		type: "text",
    		head: "Los daños a los humanos",
    		text: [
    			{
    				p: "La contaminación marina por basura y plásticos también entraña un riesgo para los seres humanos. La salud ambiental está inextricablemente ligada a la salud humana. La omnipresencia de los microplásticos en nuestro planeta suscita graves preocupaciones acerca de la seguridad de las personas. <a href=\"https://www.acs.org/content/acs/en/pressroom/newsreleases/2020/august/micro-and-nanoplastics-detectable-in-human-tissues.html\">Las investigaciones más recientes</a> demuestran que las personas inhalan microplásticos a través del aire, los consumen a través de los alimentos y el agua, y hasta los absorben a través de la piel. Se han encontrado microplásticos incluso en <strong>nuestros pulmones, hígado, bazo y riñones</strong>, y un estudio reciente detectó microplásticos en <strong>las placentas</strong> de recién nacidos."
    			},
    			{
    				p: "Aunque todavía se desconoce el alcance total del efecto sobre la salud humana, ya que la investigación es incipiente, hay pruebas fehacientes de que las sustancias químicas asociadas a los plásticos, como el metilmercurio, los plastificantes y los pirorretardantes, pueden entrar en el cuerpo y están relacionadas con problemas de salud, especialmente en el caso de las mujeres. Los científicos también creen que algunas de las sustancias químicas que se suelen encontrar en los plásticos, como el bisfenol A, los ftalatos y los bifenilos policlorados (PCB), podrían filtrarse al cuerpo. Estas sustancias químicas se han relacionado con alteraciones endocrinas, trastornos del desarrollo, anomalías reproductivas y cáncer. Es razón suficiente para adoptar un enfoque basado en la precaución."
    			}
    		]
    	},
    	{
    		type: "pill",
    		short: "China ha prohibido la importación de la mayoría de los residuos plásticos",
    		long: "En 2018, China prohibió la importación de la mayoría de los residuos plásticos para ayudar a mejorar el medio ambiente, la calidad del aire y la economía dentro de sus propias fronteras, puesto que la mayor parte de la basura acababa en vertederos, en cursos de agua y en el suelo."
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Los efectos de la contaminación por plásticos no son iguales en todo el mundo. Los países más ricos producen más residuos plásticos, que con excesiva frecuencia van a parar a los países menos adelantados, cuya gestión de los desechos es la menos sofisticada. Si bien el reciclaje puede ayudar a reducir la producción y los residuos de plástico, un problema serio es la baja tasa de reciclaje de plásticos en todo el mundo, actualmente inferior al 10%."
    			},
    			{
    				p: "Las comunidades de los países en desarrollo son las menos capacitadas para gestionar la carga ambiental, sanitaria, social y cultural de la contaminación por plásticos debido a la falta de fondos o apoyo del plano gubernamental. Esto significa que las mujeres, los niños, los trabajadores del sector de los residuos, las comunidades costeras, los pueblos indígenas y las personas que dependen del océano <a href=\"https://www.unescap.org/sites/default/files/publications/CS76%20Theme%20Study.pdf\">experimentan los efectos con mayor intensidad</a>, sobre todo cuando se trasladan o queman desechos mal gestionados. También implica un sufrimiento para estas economías, al verse asfixiadas por los plásticos."
    			},
    			{
    				p: "Los plásticos marinos repercuten negativamente en la capacidad de innumerables ecosistemas para proporcionar los beneficios básicos que los seres humanos disfrutan y asumen como normales, que van desde el agua limpia hasta la acuicultura y la pesca productivas, el control de plagas y enfermedades, la regulación del clima, y el patrimonio y las actividades recreativas. La evaluación “De la contaminación a la solución” indica que la contaminación marina por plásticos reduce los valiosos servicios de los ecosistemas marinos al menos entre 500.000 millones y 2,5 billones de dólares de los Estados Unidos cada año, y eso sin incluir otras pérdidas sociales y económicas, como las del turismo y el transporte marítimo."
    			},
    			{
    				p: "La evaluación señala que las pérdidas económicas directas para las industrias costeras y marítimas, como la pesca y el transporte marítimo, son significativas. En la región mediterránea, se calcula que estas pérdidas rondan los 138 millones de dólares al año. En la región de la Cooperación Económica Asia-Pacífico, las pérdidas ascienden a 10.800 millones de dólares, lo que supone casi una decuplicación con respecto a 2009. Sin embargo, no se informa adecuadamente de estas pérdidas, y todavía se están descubriendo los verdaderos costos de la contaminación por basura marina y plásticos para la salud humana, ambiental y social."
    			}
    		]
    	},
    	{
    		type: "header",
    		head: "Los plásticos y el cambio climático",
    		video: "coral-polluted"
    	},
    	{
    		type: "pill",
    		short: "¿Una desproporción entre las tortugas macho y hembra?",
    		long: "Los microplásticos pueden aumentar la temperatura de la arena en las playas donde anidan las tortugas marinas. Como la temperatura de la arena determina el sexo de las tortugas, esos nidos más calientes pueden alterar la proporción de tortugas macho y hembra que nacen en las playas."
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Los plásticos también son un problema para el clima. No todo el mundo sabe que el plástico se fabrica predominantemente a partir del petróleo, un combustible fósil. Cuanto más plástico fabricamos, más combustible fósil se necesita y más intensificamos la crisis climática, en un bucle continuo de retroalimentación negativa. Los productos de plástico generan además emisiones de gases de efecto invernadero a lo largo de todo su ciclo de vida. Si no se toman medidas, las emisiones de gases de efecto invernadero procedentes de la fabricación, el reciclado y la incineración de plásticos podrían representar el <a href=\"https://www.pewtrusts.org/-/media/assets/2020/07/breakingtheplasticwave_report.pdf\">19% del total de emisiones permitidas por el Acuerdo de París en 2040</a> para limitar el calentamiento a 1,5 grados centígrados."
    			},
    			{
    				p: "En los últimos años, ha aumentado la urgencia de proteger los océanos y los mares para hacer frente al cambio climático. El océano es el mayor sumidero de carbono del planeta, ya que almacena <a href=\"https://www.climate.gov/news-features/understanding-climate/climate-change-ocean-heat-content\">hasta el 90% del calor adicional que han atrapado en nuestra atmósfera las emisiones de carbono</a> y un tercio del dióxido de carbono adicional generado desde la Revolución Industrial. La absorción de grandes cantidades de carbono ha ralentizado las consecuencias visibles del calentamiento del planeta, pero también ha acelerado los efectos catastróficos que se producen bajo la superficie del agua: el calentamiento, la acidificación y el desequilibrio químico de los océanos."
    			},
    			{
    				p: "Todos los componentes de los océanos capturan carbono, sobre todo los manglares, las praderas submarinas, los corales y las marismas salobres. Cuanto más daño hagamos a los ecosistemas de nuestros océanos y zonas costeras, más difícil les resultará contrarrestar el cambio climático y seguir siendo resilientes ante él."
    			},
    			{
    				p: "Resulta alarmante constatar que <a href=\"https://www.sciencedirect.com/science/article/abs/pii/S0048969721002886\">un estudio reciente</a> sobre la contaminación marina por plásticos efectuado por GRID-Arendal, asociado del PNUMA, indica que los cuatro ecosistemas costeros que más carbono almacenan y sirven de barreras naturales frente a la subida del mar y las tormentas —los manglares, las praderas submarinas, las marismas salobres y los arrecifes de coral— están sometidos a la presión de la contaminación por plásticos de origen terrestre debido a su proximidad a los ríos. Más que nunca, los estudios e investigaciones sobre la basura marina son esenciales para predecir las consecuencias de las presiones, diseñar enfoques de mitigación y orientar la adaptación."
    			}
    		]
    	},
    	{
    		type: "pill",
    		short: "Unos manglares sanos",
    		long: "<a href=\"https://www.sciencedaily.com/releases/2011/04/110404173247.htm\">Los manglares costeros sanos almacenan más carbono por unidad de superficie que casi cualquier otro bosque de la Tierra</a>."
    	},
    	{
    		type: "header",
    		head: "De la contaminación por plásticos a la solución",
    		video: "waste"
    	},
    	{
    		type: "texto",
    		text: [
    			{
    				p: "La contaminación desenfrenada, la ruptura de la biodiversidad y la inestabilidad climática son las crisis planetarias más acuciantes de nuestro tiempo. El rápido crecimiento de la producción de plásticos ya supone una amenaza para los sistemas naturales de la Tierra, de los que depende la vida, y las previsiones apuntan a un empeoramiento. Se prevé que en 2040 los residuos plásticos representen un riesgo financiero anual de 100.000 millones de dólares de los Estados Unidos para las empresas, que tendrían que asumir los costos de la gestión de los residuos con los volúmenes previstos. Se calcula que <a href=\"https://www.eionet.europa.eu/etcs/etc-wmge/products/impact-of-covid-19-on-single-use-plastics-and-the-environment-in-europe\" target=\"_blank\">solo en Italia se generaron entre 160.000 y 440.000 toneladas métricas más de residuos</a> en 2020 debido al incremento del uso de <strong>equipos médicos de protección durante la pandemia de COVID-19</strong>. Una eliminación inadecuada de apenas un 1% de las mascarillas de un solo uso que incluye esa cifra haría que llegasen a los océanos y los contaminasen hasta 10 millones de mascarillas al mes."
    			},
    			{
    				p: "Aunque la cantidad de plásticos marinos a la que debemos hacer frente es tan grande que resulta difícil comprender la situación global, la ciencia nos dice que la mayoría de las soluciones que necesitamos ya existen. Numerosas actividades regionales, nacionales y locales están contribuyendo a reducir el vertido de plásticos a los mares, como los convenios sobre mares regionales; las prohibiciones nacionales de los plásticos de un solo uso; <a href=\"https://ellenmacarthurfoundation.org/topics/the-global-commitment/overview\">los compromisos de las empresas y los gobiernos</a> para reducir, rediseñar y reutilizar los productos de plástico; el incremento del contenido de plástico reciclado en los productos nuevos; las iniciativas de reciclaje diferenciado; y las prohibiciones a los comercios de regalar las bolsas en los municipios."
    			},
    			{
    				p: "\"<a href=\"https://www.pewtrusts.org/en/research-and-analysis/articles/2020/07/23/breaking-the-plastic-wave-top-findings\" target=\"_blank\">Rompiendo la Ola de Plástico</a>\", un análisis global sobre cómo cambiar la trayectoria de los residuos plásticos, revela que podemos reducir la cantidad de plástico que entra en los océanos en aproximadamente un 80% en las dos próximas décadas si utilizamos tecnologías y soluciones existentes."
    			},
    			{
    				p: "Sencillamente, no podemos permitirnos seguir como hasta ahora. La evaluación “De la contaminación a la solución” explica que la magnitud del problema exige compromisos y acciones urgentes a nivel mundial en todo el ciclo de vida de los plásticos —y que abarquen desde el origen hasta el mar— para lograr la necesaria reducción a largo plazo de los residuos."
    			}
    		]
    	},
    	{
    		type: "big-text",
    		text: [
    			{
    				illo: "small-illos-02",
    				p: "Mejorar los sistemas de gestión de residuos a fin de disponer de la infraestructura adecuada para recibir los residuos plásticos y garantizar que una proporción elevada pueda reutilizarse o reciclarse."
    			},
    			{
    				illo: "small-illos-03",
    				p: "Incrementar la circularidad promoviendo prácticas de consumo y producción más sostenibles en toda la cadena de valor del plástico."
    			},
    			{
    				illo: "small-illos-04",
    				p: "Implicar a los consumidores en la lucha contra la contaminación por plásticos para influir en el mercado e inspirar un cambio de comportamiento."
    			},
    			{
    				illo: "small-illos-05",
    				p: "Cerrar el grifo eliminando progresivamente los artículos de plástico innecesarios, evitables y más problemáticos y sustituyéndolos por materiales, productos y servicios alternativos."
    			},
    			{
    				illo: "small-illos-06",
    				p: "Evitar consecuencias futuras mediante un seguimiento eficaz para identificar las fuentes, las cantidades y el destino del plástico."
    			},
    			{
    				illo: "small-illos-07",
    				p: "Mejorar y reforzar la gobernanza en todos los niveles."
    			},
    			{
    				illo: "small-illos-08",
    				p: "Aumentar los conocimientos y supervisar la eficacia utilizando principios científicos demostrados."
    			},
    			{
    				illo: "small-illos-09",
    				p: "Mejorar la financiación a través de la asistencia técnica y la creación de capacidades."
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Varios acuerdos y convenios internacionales existentes ya ofrecen el apoyo necesario para reducir la contaminación marina, combatir el cambio climático (ODS 13) y utilizar sosteniblemente los océanos (ODS 14). La Alianza Mundial sobre la Basura Marina, la Convención de las Naciones Unidas sobre el Derecho del Mar y el Convenio sobre la Diversidad Biológica están directamente relacionados con la salud de los océanos, sus ecosistemas y la vida marina. Los convenios de Basilea, Estocolmo y Rotterdam guardan relación con el movimiento y la eliminación de residuos y productos químicos peligrosos. También existe un impulso creciente para alcanzar un posible acuerdo mundial sobre los desechos marinos y la contaminación por plásticos a fin de hacer frente a esta lacra."
    			},
    			{
    				p: "No hay una única solución. Como ocurre con muchas agresiones ambientales intergeneracionales, se requiere un pensamiento sistémico, innovación y transformación. No obstante, el objetivo es uno solo: reducir el uso de plásticos innecesarios, evitables y problemáticos e impedir que se viertan a nuestros lagos, ríos, humedales, costas y mares. Estamos todos juntos en esto: juntos, podemos —y debemos— resolver el problema de la contaminación por plásticos y la basura marina."
    			}
    		]
    	},
    	{
    		type: "download",
    		head: "Descargue el informe del PNUMA: From Pollution to Solution: a global assessment of marine litter and plastic pollution (“De la contaminación a la solución: evaluación mundial de la basura marina y la contaminación por plásticos”)",
    		cover: "cover",
    		downloadlink: "https://wedocs.unep.org/xmlui/bitstream/handle/20.500.11822/36963/POLSOL.pdf",
    		furtherlink: "https://www.unep.org/resources/pollution-solution-global-assessment-marine-litter-and-plastic-pollution",
    		further: "Otros recursos",
    		other: "Otros recursos (infografía)"
    	},
    	{
    		type: "pie de página",
    		head: "Súmese al PNUMA para actuar ya.",
    		text: [
    			{
    				p: "La <a href=\"https://www.unep.org/environmentassembly/about-united-nations-environment-assembly\">Asamblea de las Naciones Unidas sobre el Medio Ambiente</a> (UNEA) constituye el órgano decisorio de más alto nivel del mundo en materia ambiental, con una composición universal de los 193 Estados Miembros. La Asamblea establece las prioridades de las políticas ambientales mundiales, desarrolla el derecho ambiental internacional, proporciona liderazgo, cataliza la acción intergubernamental sobre el medio ambiente y contribuye a la aplicación de la <a href=\"https://sustainabledevelopment.un.org/\">Agenda 2030 para el Desarrollo Sostenible de las Naciones Unidas</a>. Esta histórica evaluación instará a los gobiernos en la próxima UNEA 5.2, que se celebrará en febrero de 2022, a tomar medidas mundiales y decisivas para hacer frente a la crisis de los plásticos. Podrá participar en ella acreditándose ante el Programa de las Naciones Unidas para el Medio Ambiente. Se anima a las organizaciones a que envíen pronto sus solicitudes de acreditación, para que puedan ser tramitadas a tiempo. Consulte <a href=\"https://www.unep.org/civil-society-engagement/accreditation\">para obtener más información</a>."
    			},
    			{
    				p: "A partir de la labor que el PNUMA y la <a href=\"https://unep-marine-litter.vercel.app/\">Alianza Mundial sobre la Basura Marina</a> llevan años desarrollando, la <a href=\"https://www.cleanseas.org/\">campaña Mares Limpios</a> está poniendo en contacto y movilizando a los particulares, los grupos de la sociedad civil, la industria y los gobiernos para catalizar el cambio y transformar los hábitos, prácticas, normas y políticas vigentes en todo el planeta con el objetivo de reducir sustancialmente los desechos marinos y sus repercusiones negativas. Hasta la fecha se han sumado a la campaña 63 países, y más de cien mil personas han participado en ella mediante promesas de acción, compromisos e interacciones en las redes sociales. Descubra cómo sumarse y asumir el compromiso de #MaresLimpios <a href=\"https://www.cleanseas.org/make-pledge\">aquí</a>."
    			},
    			{
    				p: "La <a href=\"https://www.gpmarinelitter.org/\">Alianza Mundial sobre la Basura Marina</a> reúne a todos los agentes que se ocupan de la prevención y reducción de la basura marina y la contaminación por plásticos. Se invita a todas las entidades que luchan contra este urgente problema mundial a sumarse a la Alianza Mundial sobre la Basura Marina <a href=\"https://www.gpmarinelitter.org/who-we-are/members/sign-up\">aquí</a>. La plataforma digital de la Alianza es una plataforma de código abierto y de múltiples partes interesadas que recopila diferentes recursos, facilita la comunicación entre las partes interesadas e integra los datos para orientar las acciones, con el objetivo de promover un acceso equitativo a los datos, la información, la tecnología y la innovación. Obtenga más información y súmese <a href=\"https://digital.gpmarinelitter.org/\">aquí</a>!"
    			},
    			{
    				p: "<a href=\"https://ellenmacarthurfoundation.org/topics/the-global-commitment/overview\">El Compromiso Global por la Nueva Economía del Plástico</a>  reúne a empresas, gobiernos y otras organizaciones de toda la cadena de valor de los plásticos en torno a <a href=\"https://emf.thirdlight.com/link/86tanzqdbppx-8rdpns/@/preview/1?o\">una visión</a> y unos objetivos comunes para abordar los residuos plásticos y la contaminación que provocan en su origen. Está encabezado por la <a href=\"https://ellenmacarthurfoundation.org/\">Ellen MacArthur Foundation</a> en colaboración con el <a href=\"https://www.unep.org/\">PNUMA</a>. Los signatarios se comprometen a llevar a cabo acciones específicas para ELIMINAR el plástico que no necesitamos; INNOVAR para garantizar que los productos de plástico que sí necesitamos sean reutilizables, reciclables o compostables, y hacer CIRCULAR todos los artículos de plástico que utilizamos para mantenerlos en la economía y fuera del medio ambiente."
    			},
    			{
    				p: "La <a href=\"https://www.oneplanetnetwork.org/sustainable-tourism/global-tourism-plastics-initiative\">Iniciativa Mundial sobre Turismo y Plásticos</a> (GTPI) constituye el nexo del Compromiso Global con el sector turístico. Más de 600 organizaciones, incluidos 20 gobiernos de todo el mundo, y más de 350 empresas que representan más del 20% de los envases de plástico utilizados en el planeta son signatarios del Compromiso Global y de la Iniciativa Mundial sobre Turismo y Plásticos."
    			},
    			{
    				p: "La <a href=\"https://www.oneplanetnetwork.org/one-planet-network-wide-plastics-initiative\">Iniciativa sobre Plásticos de la red One Planet</a> promueve acciones desde una perspectiva común basada en las pruebas y los conocimientos que emanan del PNUMA, a la vez que aprovecha las diferentes experiencias y alianzas dentro de los programas de la red One Planet. Los envases de plástico en la fase de uso de la cadena de valor de los plásticos son el punto de entrada fundamental para enmarcar la respuesta colectiva de la red."
    			}
    		]
    	}
    ];
    var resources$6 = [
    ];
    var menu$8 = [
    	{
    		item: "Descargar el informe",
    		short: "Descargar",
    		link: "https://wedocs.unep.org/xmlui/bitstream/handle/20.500.11822/36963/POLSOL.pdf"
    	}
    ];
    var meta$8 = {
    	title: "De la contaminación a la solución",
    	url: "unep.org/interactive/pollution-to-solution",
    	description: "Una evaluación rigurosa de las distintas amenazas para la salud, la economía, los ecosistemas, la fauna y flora silvestres y el clima y las soluciones relacionadas con la basura marina y la contaminación por plásticos.",
    	keywords: "Plástico en las playas, Mares limpios, Contaminación de los océanos, Contaminación por plástico, Basura en el océano, Residuos de plástico, Fuentes de contaminación del agua"
    };
    var storyES = {
    	article: article$7,
    	resources: resources$6,
    	menu: menu$8,
    	meta: meta$8
    };

    var article$6 = [
    	{
    		type: "intro",
    		head: "De la pollution<br/> <b>à la solution</b>",
    		video: "intro",
    		text: [
    			{
    				p: "Quel est le point commun entre le point le plus profond de l'océan, <b>la fosse des Mariannes</b>, et le plus haut sommet du monde,<b> le Mont Everest</b> ?"
    			},
    			{
    				p: "Alors qu'ils font partie des sites les plus isolés et les plus inaccessibles de la planète, <b>ils contiennent tous deux de minuscules morceaux de plastique issus d'activités humaines</b> se déroulant à des kilomètres de là."
    			},
    			{
    				p: "<b>Le plastique</b> représente la fraction la plus importante, nuisible et persistante de la pollution marine, soit au moins <b>85 % de la totalité des déchets marins</b>."
    			},
    			{
    				p: "On trouve des <b>volumes de plus en plus importants</b> de déchets marins le long des côtes et dans les estuaires, dans les forts courants tourbillonnaires océaniques, sur des îles isolées, dans les mers de glace..."
    			},
    			{
    				p: "… tapissant les sols marins des régions polaires jusque dans les fosses les plus profondes et les plus sombres, <b>nuisant à la vie marine</b> et détruisant les habitats sur leur passage."
    			}
    		]
    	},
    	{
    		type: "series",
    		tag: "Cet article fait partie d’une série du Programme des Nations Unies pour l’environnement (PNUE) qui montre comment l’humanité peut vivre en plus grande harmonie avec la nature sur une planète non polluée et au climat stable.",
    		kicker: "Autres articles de la série",
    		stories: [
    			{
    				item: "La vie sous l’eau",
    				link: "https://www.unep.org/interactive/status-world-coral-reefs/"
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Au cours des 70 dernières années, le plastique, un matériau incroyablement malléable, versatile et durable, a infiltré le marché et pénétré chaque recoin de la Terre. Le plastique présente d’importants avantages. Il est utilisé aussi bien dans des appareils médicaux qui sauvent des vies que pour le stockage longue durée des denrées alimentaires. Cependant, les produits plastiques inutiles et évitables, en particulier les emballages à usage unique et les objets jetables, polluent notre planète à des niveaux alarmants. Des décennies de croissance économique et une dépendance grandissante aux produits plastiques jetables ont abouti à un torrent de déchets non gérés qui se déverse dans les lacs, les rivières, les environnements côtiers et, enfin, dans la mer, entraînant toute une série de problèmes."
    			},
    			{
    				p: "<strong><a href=\"\">From Pollution to Solution: a global assessment of marine litter and plastic pollution</a></strong> (De la pollution à la solution : une évaluation mondiale de la pollution marine et plastique) montre que tous les écosystèmes font face à une menace croissante, de la source à la mer. Cette évaluation montre également que, bien que nous disposions du savoir-faire nécessaire, nous avons besoin de la volonté politique et de l'action urgente des gouvernements pour répondre à la crise grandissante. Ce rapport viendra éclairer l'adoption de mesures prioritaires lors de l'Assemblée des Nations Unies pour l'environnement (UNEA 5.2) en 2022. À cette occasion, les pays se réuniront pour fixer le cap de la coopération mondiale. La nouvelle évaluation des Nations Unies nous met en garde contre les conséquences suivantes si nous ne prenons pas en main le problème du plastique :"
    			}
    		]
    	},
    	{
    		type: "scrolly-video",
    		video: "litter",
    		text: [
    			{
    				p: "À défaut d’une action urgente, les 11 millions de tonnes de plastique estimées qui pénètrent dans l’océan chaque année seront multipliées par trois au cours des vingt prochaines années."
    			},
    			{
    				p: "Ainsi, entre 23 et 37 millions de tonnes de plastique se déverseraient dans l’océan chaque année d’ici à 2040."
    			},
    			{
    				p: "Ce volume équivaut à 50 kilogrammes de plastique par mètre de côtes à l’échelle mondiale..."
    			},
    			{
    				p: "... ou au poids de 178 Symphony of the Seas, le plus grand bateau de croisière du monde."
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Le problème a engendré une crise mondiale qui nécessite une attention et des mesures immédiates et durables. L’évaluation du PNUE lance un signal d’alarme décisif concernant l’omniprésence des déchets marins et les effets néfastes de la pollution plastique, qui vont de la dégradation de l’environnement aux risques pour la santé humaine, en passant par des pertes économiques pour les communautés et les secteurs d’activité. Elle nous montre également comment mieux agir. Il est temps d’unir nos forces pour inverser la tendance des déchets marins et de la pollution plastique en appliquant de toute urgence les nombreuses solutions à notre disposition, grandes comme petites, en faisant preuve d’innovation, d’engagement et de responsabilité."
    			}
    		]
    	},
    	{
    		type: "pill",
    		short: "Quelle est la taille des microplastiques et des nanoplastiques ?",
    		long: "Les microplastiques et les nanoplastiques sont des morceaux de plastique dont la taille peut aller de 5 millimètres à moins de quelques nanomètres."
    	},
    	{
    		type: "text",
    		head: "Effets néfastes sur la vie marine",
    		text: [
    			{
    				p: "Les déchets marins et la pollution plastique sont problématiques à bien des égards. Le plastique n’est pas biodégradable (il ne se décompose pas naturellement d’une manière qui ne nuit pas à l’environnement). À la place, il se décompose au fil du temps en morceaux de plus en plus petits appelés microplastiques et nanoplastiques, qui peuvent avoir des effets néfastes considérables."
    			},
    			{
    				p: "Les effets sur la vie marine vont des nuisances physiques ou chimiques subies par certains animaux à des effets plus larges sur la biodiversité et le fonctionnement des écosystèmes. On a retrouvé des morceaux de plastique dans le système digestif de nombreux organismes aquatiques, notamment dans chaque espèce de tortue marine et dans près de la moitié des espèces d’oiseaux marins et de mammifères marins qui ont fait l’objet d’une étude."
    			}
    		]
    	},
    	{
    		type: "scrolly-video",
    		video: "harm_to_animals",
    		text: [
    			{
    				p: "Les tortues marines confondent les sacs en plastique flottants avec des méduses et meurent lentement de faim à mesure que leurs estomacs se remplissent de déchets indigestes."
    			},
    			{
    				p: "Les oiseaux marins picorent le plastique, car il <a href=\"https://www.nature.com/articles/376680a0.epdf?sharing_token=XzA3pMyq1-90bp8IHPsDiNRgN0jAjWel9jnR3ZoTv0NjqwHPzT2EZOmoupSkNogAcZGDea6VHenadcy2ZVTQLAQygdRw7H4UC7py46oKWTeTp_jR-LXk4EUiQD6fCfvgRxa9FeT2BsqDP4gNHAHc1UOJNEfRsAF6L4Fzte3kHmnRcOOaeLbB7-DtdeGWOnUkVs0C8l8RNzNyQal8GyWw8jg93siTVTmEMCZPcazH8Z6Ugd6g-RzwR2_TN5PgL8qQP1k1RCdu4pqP8R7_z_ucaoN-S1AoVv52tqlLZZR6c5k%3D&amp;tracking_referrer=www.scientificamerican.com\">a l'odeur et l'apparence d'un aliment</a>."
    			},
    			{
    				p: "Il n'est pas rare que des mammifères marins, des tortues marines et d'autres animaux se noient après s'être retrouvés piégés dans <a href=\"https://www.fisheries.noaa.gov/alaska/marine-life-distress/pinniped-entanglement-marine-debris\">des objets en plastique perdus ou jetés</a>, notamment des emballages ou des équipements de pêche."
    			},
    			{
    				p: "<a href=\"https://www.fisheries.noaa.gov/species/north-atlantic-right-whale\">Les baleines noires de l'Atlantique Nord</a>, qui comptent parmi les baleines les plus gravement menacées d'extinction au monde, sont prises au piège d'engins de pêche fantôme, ce qui constitue l'une de leurs principales causes de décès."
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Certains effets sont plus insidieux. Non seulement les toxines déjà présentes dans le plastique touchent la chaîne alimentaire marine, mais l’on sait aussi que les morceaux de plastique absorbent des polluants d’origine terrestre qui se déversent dans la mer, notamment les déchets pharmaceutiques et industriels. La toxicité peut se transférer tout au long de la chaîne alimentaire à mesure que les espèces marines mangent et sont mangées. Les préoccupations vont également grandissantes concernant les espèces invasives qui traversent l’océan sur des déchets flottants pour atteindre des mers et des terres étrangères, comme les algues, les mollusques et les balanes, qui peuvent envahir et dégrader des milieux et des espèces aquatiques éloignés. N’oublions pas enfin que la plupart des déchets plastiques dans l’océan finissent par sombrer et recouvrir les fonds marins, étouffant les récifs de corail et la vie des fonds marins, ce qui ne fait qu’aggraver le problème."
    			}
    		]
    	},
    	{
    		type: "illo",
    		illo: "woman"
    	},
    	{
    		type: "text",
    		head: "Effets néfastes sur les êtres humains",
    		text: [
    			{
    				p: "La pollution marine et plastique représente également un risque pour les êtres humains. La santé environnementale et la santé humaine sont indissociables. L'omniprésence des microplastiques sur toute la planète soulève de sérieuses préoccupations en matière de sécurité. <a href=\"https://www.acs.org/content/acs/en/pressroom/newsreleases/2020/august/micro-and-nanoplastics-detectable-in-human-tissues.html\">De nouvelles recherches</a> indiquent que les personnes inhalent des microplastiques avec l'air qu'elles respirent, en ingèrent à travers les aliments et l'eau qu'elles consomment et en absorbent même par la peau. On a ainsi retrouvé des microplastiques dans <strong>les poumons, le foie, la rate et les reins d'êtres humains</strong>. Une étude récente a également mis en évidence la présence de microplastiques dans <strong>le placenta</strong> de nouveau-nés."
    			},
    			{
    				p: "L’ampleur totale des effets sur la santé humaine demeure inconnue, car il s’agit d’un champ de recherche naissant. Cependant, on observe des éléments substantiels démontrant que les produits chimiques associés au plastique, tels que le méthylmercure, les plastifiants et les retardateurs de flamme, peuvent pénétrer dans le corps et sont liés à des problèmes de santé, en particulier chez les femmes. Les scientifiques pensent également que certains des produits chimiques couramment présents dans le plastique, comme le bisphénol A, les phtalates et les polychlorobiphényles (PCB), peuvent s’immiscer dans le corps. On a établi un lien entre ces produits chimiques et des perturbations endocriniennes, des troubles du développement, des anomalies reproductives et des cancers, autant de raisons qui justifient l’adoption d’un principe de précaution."
    			}
    		]
    	},
    	{
    		type: "pill",
    		short: "La Chine a interdit l’importation de la plupart des déchets plastiques",
    		long: "En 2018, la Chine a interdit l’importation de la plupart des déchets plastiques pour contribuer à améliorer l’environnement, la qualité de l’air et l’économie au sein de ses propres frontières, car ils finissaient pour l’essentiel dans des sites d’enfouissement ou dans les cours d’eau et les sols."
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Les effets de la pollution plastique ne sont pas ressentis de la même manière partout dans le monde. Les pays plus riches produisent plus de déchets plastiques, qui finissent bien trop souvent dans les pays moins développés où la gestion des déchets est moins sophistiquée. Le recyclage peut contribuer à réduire la production de plastique et la pollution plastique. Cependant, le taux de recyclage du plastique au niveau mondial est actuellement inférieur à 10 %, ce qui constitue un problème de taille."
    			},
    			{
    				p: "Les communautés dans les pays en développement sont les moins à même de gérer le fardeau environnemental, sanitaire, social et culturel de la pollution plastique en raison du manque de soutien gouvernemental ou de financements. Par conséquent, les femmes, les enfants, les agents chargés de la gestion des déchets, les communautés côtières, les peuples autochtones et les personnes qui dépendent de l'océan <a href=\"https://www.unescap.org/sites/default/files/publications/CS76%20Theme%20Study.pdf\">ressentent de manière plus intense les effets de cette pollution</a>, en particulier lorsqu'ils déplacent ou incinèrent des déchets mal gérés. En retour, ces économies souffrent, car elles suffoquent sous le plastique."
    			},
    			{
    				p: "Les déchets plastiques marins ont des effets néfastes sur la capacité d’une myriade d’écosystèmes à fournir des bénéfices fondamentaux dont les êtres humains profitent et qu’ils tiennent pour acquis, qui vont de l’eau potable, de l’aquaculture et des pêcheries productives au contrôle des nuisibles et des maladies ou encore à la régulation du climat, en passant par le patrimoine et les activités de loisirs. Selon l’évaluation « Pollution to Solution », la pollution plastique marine réduit la valeur des services écosystémiques marins d’au moins 500 à 2 500 milliards de dollars des États-Unis par an, sans inclure les autres pertes sociales et économiques concernant, par exemple, le tourisme et le transport maritime."
    			},
    			{
    				p: "L’évaluation indique également que les pertes économiques directes pour les secteurs d’activité côtiers et marins, tels que les pêcheries et le transport maritime, sont considérables. En Méditerranée, on estime que ces pertes avoisinent 138 millions de dollars des États-Unis par an. Dans la région de coopération économique de l’Asie et du Pacifique, les pertes atteignent 10,8 milliards de dollars des États-Unis au total, soit un montant environ dix fois plus élevé qu’en 2009. Cependant, ces pertes ne sont pas bien déclarées et le coût véritable des déchets marins et de la pollution plastique sur la santé humaine, environnementale et sociale reste à découvrir."
    			}
    		]
    	},
    	{
    		type: "header",
    		head: "Le plastique et le changement climatique",
    		video: "coral-polluted"
    	},
    	{
    		type: "pill",
    		short: "Un ratio inégal de tortues mâles et femelles ?",
    		long: "Les microplastiques peuvent faire augmenter la température du sable sur les plages où les tortues marines pondent leurs œufs. Étant donné que la température du sable détermine le sexe des tortues, ces nids plus chauds pourraient altérer le ratio entre les tortues mâles et femelles qui naissent sur ces plages."
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Le plastique constitue également un problème climatique. Certains ignorent que le plastique est pour l'essentiel produit à partir du pétrole, une énergie fossile. Plus nous produisons de plastique, plus nous consommons d'énergie fossile, et plus nous aggravons la crise climatique, alimentant ainsi un cercle vicieux continu. En outre, les produits plastiques génèrent des gaz à effet de serre tout au long de leur cycle de vie. Par exemple, à moins de prendre des mesures, les émissions de gaz à effet de serre découlant de la production, du recyclage et de l'incinération des produits plastiques pourraient représenter <a href=\"https://www.pewtrusts.org/-/media/assets/2020/07/breakingtheplasticwave_report.pdf\">19 % des émissions totales autorisées en vertu de l'Accord de Paris en 2040</a> pour limiter le réchauffement à 1,5 °C."
    			},
    			{
    				p: "Ces dernières années, il est devenu de plus en plus urgent de protéger l'océan et les mers pour lutter contre le changement climatique. L'océan constitue le plus important réservoir de carbone de la planète. Il stocke <a href=\"https://www.climate.gov/news-features/understanding-climate/climate-change-ocean-heat-content\">jusqu'à 90 % de la chaleur additionnelle que les émissions de carbone ont piégée dans notre atmosphère</a> et un tiers du dioxyde de carbone supplémentaire produit depuis la révolution industrielle. L'absorption de grandes quantités de carbone a ralenti les effets visibles du réchauffement de la planète, mais a également accéléré les effets catastrophiques sous la surface de l'eau : l'océan se réchauffe, s'acidifie et se déséquilibre sur le plan chimique."
    			},
    			{
    				p: "Le carbone est séquestré dans chaque composante de l’océan, en particulier dans les mangroves, les herbiers marins, les récifs de corail et les schorres. Plus nous endommageons l’océan et les zones côtières, plus il est difficile pour ces écosystèmes de contrebalancer le changement climatique et de rester résilients face à ce phénomène."
    			},
    			{
    				p: "Plus alarmant encore, <a href=\"https://www.sciencedirect.com/science/article/abs/pii/S0048969721002886\">selon une étude récente</a> sur la pollution plastique marine réalisée par GRID-Arendal, un partenaire du PNUE, les quatre écosystèmes côtiers qui stockent le plus de carbone et servent de barrières naturelles face à la montée des eaux et aux tempêtes, à savoir les mangroves, les herbiers marins, les schorres et les récifs de corail, sont soumis à des pressions dues à la pollution plastique d'origine terrestre en raison de leur proximité avec les rivières. Les études et les recherches sur les déchets marins sont plus que jamais essentielles pour prédire les conséquences des pressions, concevoir des mesures d'atténuation et orienter les stratégies d'adaptation."
    			}
    		]
    	},
    	{
    		type: "pill",
    		short: "Des mangroves saines",
    		long: "<a href=\"https://www.sciencedaily.com/releases/2011/04/110404173247.htm\">Les mangroves côtières saines stockent plus de carbone par zone unitaire que presque n'importe quelle autre forêt de la planète</a>."
    	},
    	{
    		type: "header",
    		head: "De la pollution plastique à la solution",
    		video: "waste"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "La pollution généralisée, l'effondrement de la biodiversité et l'instabilité climatique constituent les crises planétaires les plus urgentes de notre époque. La croissance rapide de la production de plastique menace déjà les systèmes naturels de la Terre dont la vie dépend, et cette menace ne fera que s'aggraver selon les projections. D'ici à 2040, les déchets plastiques devraient représenter un risque financier annuel de 100 milliards de dollars des États-Unis pour les entreprises qui devront assumer le coût de la gestion des déchets aux volumes attendus. On estime que, <a href=\"https://www.eionet.europa.eu/etcs/etc-wmge/products/impact-of-covid-19-on-single-use-plastics-and-the-environment-in-europe\" target=\"_blank\">rien qu'en Italie, entre 160 000 et 440 000 tonnes de déchets supplémentaires</a> ont été produites en 2020 en raison d'une plus forte dépendance aux <strong>équipements médicaux protecteurs pendant la pandémie de COVID-19</strong>. Il suffirait que 1 % des masques à usage unique qui contribuent à ce volume soient jetés de manière inappropriée pour que jusqu'à 10 millions de masques se retrouvent dans les océans et les polluent chaque mois."
    			},
    			{
    				p: "Alors que la quantité de plastique marin que nous devons prendre en charge est si importante qu'on peut difficilement se la représenter, la science nous montre que la plupart des solutions à mettre en place existent déjà. De nombreuses activités régionales, nationales et locales contribuent à réduire le déversement de plastiques dans les mers, telles que les Conventions concernant les mers régionales, les interdictions nationales de produits plastiques à usage unique, <a href=\"https://ellenmacarthurfoundation.org/topics/the-global-commitment/overview\">les engagements pris par les entreprises et les gouvernements</a> pour réduire, reconcevoir et réutiliser les produits plastiques ainsi que pour augmenter la part du plastique recyclé dans les nouveaux produits, les initiatives le long des trottoirs et les interdictions municipales des sacs en plastique."
    			},
    			{
    				p: "<a href=\"https://www.pewtrusts.org/en/research-and-analysis/articles/2020/07/23/breaking-the-plastic-wave-top-findings\" target=\"_blank\">Breaking the Plastic Wave</a> (Briser la vague du plastique), une analyse mondiale qui examine comment modifier la trajectoire des déchets plastiques, révèle que nous pouvons réduire la quantité de plastique qui se retrouve dans l'océan d'environ 80 % au cours des deux prochaines décennies en utilisant des technologies et des solutions existantes."
    			},
    			{
    				p: "Nous ne pouvons tout simplement pas faire comme si de rien n’était. L’évaluation « Pollution to Solution » explique que, vu l’ampleur du problème, il est nécessaire de prendre de toute urgence des engagements et des mesures au niveau mondial, tout au long du cycle de vie du plastique et de la source à la mer, afin de pouvoir réduire à long terme la quantité de déchets."
    			}
    		]
    	},
    	{
    		type: "big-text",
    		text: [
    			{
    				illo: "small-illos-02",
    				p: "Améliorer les systèmes de gestion des déchets afin que les infrastructures appropriées soient disponibles pour recevoir les déchets plastiques et garantir qu’une proportion élevée de ceux-ci puisse être réutilisée ou recyclée."
    			},
    			{
    				illo: "small-illos-03",
    				p: "Améliorer la circularité en promouvant des pratiques de consommation et de production durables tout au long de la chaîne de valeur du plastique."
    			},
    			{
    				illo: "small-illos-04",
    				p: "Mobiliser les consommateurs à l’appui de la lutte contre la pollution plastique en vue d’influencer le marché et d’inspirer des changements de comportement."
    			},
    			{
    				illo: "small-illos-05",
    				p: "Fermer le robinet en éliminant progressivement les objets plastiques inutiles, évitables et les plus problématiques et en les remplaçant par d’autres matériaux, produits et services."
    			},
    			{
    				illo: "small-illos-06",
    				p: "Gérer les conséquences au moyen d’un suivi efficace pour identifier les sources, les quantités et le sort des plastiques."
    			},
    			{
    				illo: "small-illos-07",
    				p: "Améliorer et renforcer la gouvernance à tous les niveaux."
    			},
    			{
    				illo: "small-illos-08",
    				p: "Améliorer les connaissances et suivre l’efficacité en faisant preuve de rigueur scientifique."
    			},
    			{
    				illo: "small-illos-09",
    				p: "Améliorer le financement grâce à une assistance technique et à un renforcement des capacités."
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Plusieurs accords et conventions internationaux existants fournissent déjà un appui pour réduire la pollution marine, lutter contre les changements climatiques (treizième objectif de développement durable) et exploiter de manière durable les océans (quatorzième objectif de développement durable). Le Partenariat mondial sur les déchets marins, la Convention des Nations Unies sur le droit de la mer et la Convention sur la diversité biologique sont directement liés à la santé de l’océan, à ses écosystèmes et à la vie marine. Les conventions de Bâle, de Stockholm et de Rotterdam sont liées aux mouvements et à l’élimination des déchets et des produits chimiques dangereux. On observe également un élan grandissant en faveur d’un éventuel accord mondial sur les déchets marins et la pollution plastique pour lutter contre ce fléau."
    			},
    			{
    				p: "Il n’existe pas de solution unique. À l’instar des nombreuses agressions intergénérationnelles perpétrées contre l’environnement, ce problème nécessite une approche systémique, axée sur l’innovation et la transformation. Cependant, toutes les solutions tendent vers un même but : réduire l’utilisation de plastiques inutiles, évitables et problématiques et interrompre leur déversement dans les lacs, les rivières, les zones humides, les côtes et les mers. Nous sommes tous concernés et, ensemble, nous pouvons et devons résoudre le problème des déchets marins et de la pollution plastique."
    			}
    		]
    	},
    	{
    		type: "download",
    		head: "Télécharger le rapport du PNUE : From Pollution to Solution: a global assessment of marine litter and plastic pollution",
    		cover: "cover",
    		other: "Autres ressources (infographies)",
    		downloadlink: "https://wedocs.unep.org/xmlui/bitstream/handle/20.500.11822/36963/POLSOL.pdf",
    		furtherlink: "https://www.unep.org/resources/pollution-solution-global-assessment-marine-litter-and-plastic-pollution",
    		further: "Ressources complémentaires"
    	},
    	{
    		type: "footer",
    		head: "Rejoignez le PNUE pour agir dès maintenant !",
    		text: [
    			{
    				p: "L'<a href=\"https://www.unep.org/environmentassembly/about-united-nations-environment-assembly\">Assemblée des Nations Unies pour l'environnement</a> (UNEA) est la plus haute instance décisionnaire du monde en matière d'environnement. Les 193 États membres en font partie, ce qui lui confère une portée universelle. L'Assemblée fixe les priorités en matière de politiques mondiales sur l'environnement, élabore le droit international de l'environnement, assure une direction, catalyse l'action intergouvernementale en matière d'environnement, et contribue à la mise en œuvre du <a href=\"https://sustainabledevelopment.un.org/\">Programme de développement durable à l'horizon 2030</a>. Cette évaluation phare incitera les gouvernements à prendre des mesures décisives et mondiales lors de la prochaine UNEA-5.2 de février 2022 pour répondre à la crise du plastique. Vous pourrez participer en vous faisant accréditer auprès du Programme des Nations Unies pour l'environnement. Les organisations sont encouragées à envoyer leurs demandes d'accréditation le plus tôt possible afin qu'elles puissent être traitées à temps. Pour en savoir plus, cliquez <a href=\"https://www.unep.org/civil-society-engagement/accreditation\">ici</a>."
    			},
    			{
    				p: "Ancrée dans le travail de longue date du PNUE et du <a href=\"https://unep-marine-litter.vercel.app/\">Partenariat mondial sur les déchets marins (GPML)</a>, la <a href=\"https://www.cleanseas.org/\">campagne Clean Seas</a> met en relation et mobilise les particuliers, les groupes de la société civile, les entreprises et les gouvernements pour accélérer le changement et transformer les habitudes, les pratiques, les normes et les politiques dans le monde entier en vue de réduire drastiquement les déchets marins et leurs effets néfastes. À ce jour, 63 pays ont rejoint la campagne et plus de 100 000 particuliers y ont participé au moyen de promesses d'action, d'engagements et d'interactions sur les réseaux sociaux. Découvrez comment rejoindre la campagne et prêter le serment #CleanSeas <a href=\"https://www.cleanseas.org/make-pledge\">ici</a>."
    			},
    			{
    				p: "Le <a href=\"https://www.gpmarinelitter.org/\">Partenariat mondial sur les déchets marins</a> (GPML) rassemble tous les acteurs œuvrant à prévenir et à réduire les déchets marins et la pollution plastique. Toutes les entités qui contribuent à résoudre ce problème mondial urgent sont invitées à rejoindre le GPML <a href=\"https://www.gpmarinelitter.org/who-we-are/members/sign-up\">ici</a>. La plateforme numérique du GPML est une plateforme open source multipartite qui compile différentes ressources, relie les parties prenantes et intègre les données pour orienter l'action, dans l'objectif de promouvoir un accès équitable aux données, à l'information, à la technologie et à l'innovation. Pour en savoir plus et rejoindre le GPML, cliquez <a href=\"https://digital.gpmarinelitter.org/\">ici</a> !"
    			},
    			{
    				p: "<a href=\"https://ellenmacarthurfoundation.org/topics/the-global-commitment/overview\">The New Plastics Economy Global Commitment</a> (l'Engagement mondial pour une nouvelle économie des plastiques) rassemble des entreprises, des gouvernements et d'autres organisations intervenant tout au long de la chaîne de valeur du plastique au service d'une <a href=\"https://emf.thirdlight.com/link/86tanzqdbppx-8rdpns/@/preview/1?o\">vision commune</a> et d'objectifs partagés pour remédier au problème de la pollution et des déchets plastiques à sa source. Cette initiative est dirigée par la <a href=\"https://ellenmacarthurfoundation.org/\">Fondation Ellen MacArthur</a> en collaboration avec le <a href=\"https://www.unep.org/\">PNUE</a>. Les signataires s'engagent à prendre des mesures spécifiques pour ÉLIMINER le plastique inutile ; à INNOVER afin de garantir que les produits plastiques nécessaires soient réutilisables, recyclables ou compostables ; et à FAIRE CIRCULER tous les objets en plastique que nous utilisons afin qu'ils restent dans l'économie et hors de l'environnement."
    			},
    			{
    				p: "La <a href=\"https://www.oneplanetnetwork.org/sustainable-tourism/global-tourism-plastics-initiative\">Global Tourism Plastics Initiative</a> (GTPI) (Initiative mondiale sur les plastiques dans le secteur du tourisme) constitue l'interface de l'Engagement mondial avec le secteur du tourisme. Plus de 600 organisations dont 20 gouvernements du monde entier et plus de 350 entreprises représentant plus de 20 % des emballages en plastique utilisés au niveau mondial sont signataires de l'Engagement mondial et de la GTPI."
    			},
    			{
    				p: "La <a href=\"https://www.oneplanetnetwork.org/one-planet-network-wide-plastics-initiative\">One Planet Network-Wide Plastics Initiative</a> (Initiative sur le plastique à l'échelle du réseau One Planet) promeut des actions dans le cadre d'un discours commun qui s'appuie sur les données probantes et les connaissances produites par le PNUE, tout en tirant parti de l'expertise et des partenariats variés au sein des programmes du réseau One Planet. Les emballages en plastique se trouvant au stade de l'utilisation dans la chaîne de valeur du plastique constituent le principal point d'entrée pour organiser la riposte collective du réseau."
    			}
    		]
    	}
    ];
    var resources$5 = [
    ];
    var menu$7 = [
    	{
    		item: "Télécharger le rapport",
    		short: "Télécharger",
    		link: "https://wedocs.unep.org/xmlui/bitstream/handle/20.500.11822/36963/POLSOL.pdf"
    	}
    ];
    var meta$7 = {
    	title: "De la pollution à la solution",
    	url: "unep.org/interactive/pollution-to-solution",
    	description: "Une évaluation rigoureuse de diverses menaces qui pèsent sur la santé, l’économie, les écosystèmes, la vie sauvage et le climat ainsi que des solutions associées aux déchets marins et à la pollution plastique.",
    	keywords: "Plastique sur les plages, campagne Clean Seas, Pollution marine, Pollution plastique, Déchets marins, Déchets plastiques, Sources de pollution de l’eau"
    };
    var storyFR = {
    	article: article$6,
    	resources: resources$5,
    	menu: menu$7,
    	meta: meta$7
    };

    var article$5 = [
    	{
    		type: "intro",
    		head: "Dari Polusi<br/> <b>ke Solusi</b>",
    		video: "intro",
    		text: [
    			{
    				p: "Apa kesamaan mendasar dari palung samudera terdalam di dunia <b> Palung Mariana </b>, dengan puncak gunung tertinggi di dunia <b> Gunung  Everest </b>?"
    			},
    			{
    				p: "Meskipun keduanya termasuk lingkungan paling terpencil dan susah dijangkau, <b> Palung Mariana dan Gunung Everest mengandung potongan-potongan kecil plastik dari aktivitas manusia </b> yang jauhnya bermil-mil."
    			},
    			{
    				p: "<b>Plastik</b> merupakan bagian dari sampah laut terbesar, paling berbahaya, terjadi terus-menerus, dan berjumlah setidaknya <b>85 persen dari total limbah laut</b>."
    			},
    			{
    				p: "Sampah laut ditemukan dalam <b> volume yang meningkat </b>  di sepanjang garis pantai dan muara kita, di pusaran besar di tengah laut, di pulau-pulau terpencil, di es laut, ..."
    			},
    			{
    				p: "… melintasi dasar laut dari daerah kutub hingga ke parit tergelap terdalam, <b>merusak kehidupan laut</b> dan merusak habitat di yang dilaluinya."
    			}
    		]
    	},
    	{
    		type: "series",
    		tag: "Cerita ini adalah bagian suatu seri persembahan dari UNEP yang menampilkan bagaimana manusia dapat hidup lebih selaras dengan alam di bumi yang bebas polusi dan iklim yang stabil.",
    		kicker: "Cerita lainnya dari serial",
    		stories: [
    			{
    				item: "Kehidupan di Bawah Laut",
    				link: "https://www.unep.org/interactive/status-world-coral-reefs/"
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Selama 70 tahun terakhir, plastik - bahan yang sangat mudah dibentuk, serbaguna, dan tahan lama - memenuhi pasar dan tampaknya digunakan di berbagai tempat dan daerah di Bumi. Plastik dapat memberikan manfaat penting, mulai dari perangkat medis yang menyelamatkan jiwa hingga penyimpanan makanan yang aman dan tahan lama. Namun, produk plastik yang tidak perlu dan dapat dihindari, terutama kemasan sekali pakai dan barang sekali pakai, mencemari bumi kita pada tingkat yang mengkhawatirkan. Pertumbuhan ekonomi selama beberapa dekade dan ketergantungan yang meningkat pada produk plastik yang dibuang begitu saja telah menyebabkan luapan limbah yang tidak terkelola yang mengalir ke danau, sungai, lingkungan pesisir, dan akhirnya ke laut, memicu riak masalah."
    			},
    			{
    				p: "<strong><a href=\"\"> From Pollution to Solution: a global assessment of marine litter and plastic pollution </a></strong> menunjukkan bahwa ada ancaman yang berkembang di semua ekosistem mulai dari sumbernya hingga ke lautan. Ini juga menunjukkan bahwa meskipun kita memiliki pengetahuan, kita membutuhkan kemauan politik dan tindakan segera dari pemerintah untuk mengatasi krisis yang meningkat. Laporan tersebut akan menginformasikan tindakan prioritas di Majelis Lingkungan PBB (UNEA 5.2) pada tahun 2022, di mana negara-negara akan berkumpul untuk memutuskan langkah ke depan untuk kerja sama global. Kajian PBB yang baru memperingatkan akibat yang terjadi apabila kita tidak menangani masalah plastik kita:"
    			}
    		]
    	},
    	{
    		type: "scrolly-video",
    		video: "litter",
    		text: [
    			{
    				p: "Tanpa tindakan segera, diperkirakan 11 juta metrik ton plastik yang saat ini memasuki lautan setiap tahun akan meningkat tiga kali lipat dalam dua puluh tahun ke depan."
    			},
    			{
    				p: "Hal ini berarti bisa jadi terdapat 23 hingga 37 juta metrik ton plastik mengalir ke laut setiap tahunnya pada tahun 2040."
    			},
    			{
    				p: "Jumlah ini setara dengan 50 kilogram plastik per meter dari garis pantai di seluruh dunia …"
    			},
    			{
    				p: "...atau dengan berat yang setara dengan 178 Kapal Symphony of the Seas, kapal pesiar terbesar di dunia."
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Masalah ini telah berkembang menjadi krisis global yang membutuhkan perhatian dan tindakan yang segera dan berkelanjutan. Kajian ini memberikan peringatan definitif mengenai sampah laut yang ada di mana-mana dan dampak buruk polusi plastik – mulai dari degradasi lingkungan sampai kerugian ekonomi bagi masyarakat dan industri, hingga risiko kesehatan manusia – dan menunjukkan kepada kita bagaimana kita bisa berbuat lebih baik. Inilah saatnya bergandengan tangan untuk mengubah arus sampah laut dan polusi plastik dengan menerapkan banyak solusi – besar dan kecil – yang ada, dengan urgensi, inovasi, komitmen, dan akuntabilitas."
    			}
    		]
    	},
    	{
    		type: "pill",
    		short: "Seberapa kecilkah mikroplastik dan nanoplastik?",
    		long: "Mikroplastik dan nanoplastik adalah potongan plastik yang panjangnya berkisar dari 5  milimeter hingga kurang dari beberapa nanometer."
    	},
    	{
    		type: "text",
    		head: "Bahaya bagi Kehidupan Laut",
    		text: [
    			{
    				p: "Sampah laut dan polusi plastik bermasalah akibat banyak hal. Plastik tidak mengalami biodegradasi (terurai secara alami dengan cara yang tidak berbahaya bagi lingkungan). Sebaliknya, mereka terurai dari waktu ke waktu menjadi potongan-potongan yang lebih kecil yang dikenal sebagai mikroplastik dan nanoplastik yang dapat memiliki dampak negatif yang signifikan."
    			},
    			{
    				p: "Dampak terhadap kehidupan laut meliputi kerusakan fisik atau kimia pada individu hewan, hingga efek yang lebih luas pada keanekaragaman hayati dan fungsi ekosistem. Potongan plastik telah ditemukan dalam sistem pencernaan banyak organisme akuatik, termasuk di setiap spesies penyu dan hampir setengah dari semua spesies burung laut dan mamalia laut yang disurvei."
    			}
    		]
    	},
    	{
    		type: "scrolly-video",
    		video: "harm_to_animals",
    		text: [
    			{
    				p: "Penyu mengira kantong plastik mengambang sebagai ubur-ubur, perlahan-lahan penyu menjadi kelaparan karena perut mereka dipenuhi sampah yang tidak dapat dicerna."
    			},
    			{
    				p: "Burung laut mematuk plastik karena <<a href=\"https://www.nature.com/articles/376680a0.epdf?sharing_token=XzA3pMyq1-90bp8IHPsDiNRgN0jAjWel9jnR3ZoTv0NjqwHPzT2EZOmoupSkNogAcZGDea6VHenadcy2ZVTQLAQygdRw7H4UC7py46oKWTeTp_jR-LXk4EUiQD6fCfvgRxa9FeT2BsqDP4gNHAHc1UOJNEfRsAF6L4Fzte3kHmnRcOOaeLbB7-DtdeGWOnUkVs0C8l8RNzNyQal8GyWw8jg93siTVTmEMCZPcazH8Z6Ugd6g-RzwR2_TN5PgL8qQP1k1RCdu4pqP8R7_z_ucaoN-S1AoVv52tqlLZZR6c5k%3D&amp;tracking_referrer=www.scientificamerican.com\"> plastik memiliki aroma dan wujud seperti makanan</a>"
    			},
    			{
    				p: "Mamalia laut, penyu, dan hewan lainnya sering tenggelam setelah terperangkap pada <a href=\"https://www.fisheries.noaa.gov/alaska/marine-life-distress/pinniped-entanglement-marine-debris\"> plastik yang hanyut atau plastik yang terbuang </a> termasuk diantaranya adalah plastik kemasan atau alat tangkap."
    			},
    			{
    				p: "Penyebab utama kematian <a href=\"https://www.fisheries.noaa.gov/species/north-atlantic-right-whale\">Paus Kanan Atlantik Utara</a>, salah satu paus yang paling terancam punah di dunia adalah terjerat dalam alat penangkap jenis jaring hantu."
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Ada pula dampak yang kurang jelas. Racun yang sudah ditemukan dalam plastik tidak hanya memengaruhi jaring makanan laut, tetapi potongan plastik juga terkenal menyerap polutan yang mengalir dari daratan ke laut, termasuk limbah farmasi dan industri. Toksisitas dapat berpindah melalui rantai makanan saat spesies laut makan dan dimakan. Ada juga kekhawatiran yang berkembang tentang spesies yang berlalu lalang yang menumpang melintasi lautan sampah yang mengambang ke laut dan tanah asing, seperti ganggang, moluska, dan teritip, yang dapat menyerang dan merusak lingkungan dan spesies perairan yang jauh. Masalahnya diperparah dengan kenyataan bahwa sebagian besar sampah plastik di lautan akhirnya tenggelam ke dasar laut seperti tumpukan sampah yang terendam, menutupi terumbu karang dan kehidupan dasar laut."
    			}
    		]
    	},
    	{
    		type: "illo",
    		illo: "woman"
    	},
    	{
    		type: "text",
    		head: "Bahaya bagi Manusia",
    		text: [
    			{
    				p: "Manusia juga terkena risiko dari sampah laut dan polusi plastik. Kesehatan lingkungan erat kaitannya dengan kesehatan manusia. Meluasnya mikroplastik di planet kita. menimbulkan kekhawatiran serius terhadap keselamatan manusia. <a href=\"https://www.acs.org/content/acs/en/pressroom/newsreleases/2020/august/micro-and-nanoplastics-detectable-in-human-tissues.html\"> Riset baru </a> menunjukkan bahwa masyarakat menghirup mikroplastik melalui udara, mengonsumsinya melalui makanan dan air dan bahkan menyerapnya melalui kulit. Mikroplastik bahkan telah ditemukan di <strong> paru-paru, hati, limpa, dan ginjal </strong>,  kita, dan suatu penelitian baru-baru ini telah menemukan mikroplastik di <strong> plasenta</strong> bayi yang baru lahir."
    			},
    			{
    				p: "Dampak pada kesehatan manusia secara menyeluruh masih belum diketahui karena penelitian ini masih baru. Namun, ada bukti substansial bahwa bahan kimia terkait plastik, seperti metil merkuri, plasticizer, dan substansi penghambat api, dapat masuk ke dalam tubuh dan terkait dengan masalah kesehatan, terutama pada wanita. Para ilmuwan juga percaya bahwa beberapa bahan kimia umum yang ditemukan dalam plastik, seperti bisphenol A, phthalates, dan polychlorinated biphenyls (PCB), dapat larut ke dalam tubuh. Bahan kimia ini telah dikaitkan dengan gangguan endokrin, gangguan perkembangan, kelainan reproduksi dan kanker. Penjelasan tadi telah menjadi alasan yang cukup untuk mengadopsi pendekatan pencegahan."
    			}
    		]
    	},
    	{
    		type: "pill",
    		short: "China melarang impor sebagian besar sampah plastik",
    		long: "Pada tahun 2018, China melarang impor sebagian besar sampah plastik untuk membantu meningkatkan lingkungan, kualitas udara, dan ekonomi di dalam perbatasannya sendiri mengingat sebagian besar sampah berakhir di tempat pembuangan sampah atau di saluran air dan tanah."
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Dampak polusi plastik tidak dirasakan secara merata di seluruh dunia. Negara-negara yang lebih kaya menghasilkan lebih banyak sampah plastik yang sering kali mengalir ke negara-negara kurang berkembang, di mana pengelolaan sampahnya kurang canggih. Daur ulang dapat membantu mengurangi produksi plastik dan sampah plastik; namun, masalah utama adalah rendahnya tingkat daur ulang plastik di seluruh dunia yang saat ini kurang dari 10 persen."
    			},
    			{
    				p: "Masyarakat di negara berkembang juga sangat kurang mampu mengelola beban lingkungan, kesehatan, sosial dan budaya karena kurangnya dukungan atau dana pemerintah. Itu berarti perempuan, anak-anak, pekerja bidang persampahan, komunitas pesisir, Masyarakat Adat, dan orang-orang yang bergantung pada laut<a href=\"https://www.unescap.org/sites/default/files/publications/CS76%20Theme%20Study.pdf\">merasakan dampaknya lebih intens </a>, terutama saat memindahkan atau membakar sampah yang tidak dikelola dengan baik. Ini juga berarti ekonomi ini menderita karena tercekam oleh plastik."
    			},
    			{
    				p: "Plastik laut berdampak negatif terhadap kemampuan berbagai ekosistem untuk memberikan manfaat dasar yang dinikmati dan diterima oleh manusia secara cuma-cuma, mulai dari air bersih hingga budidaya dan perikanan yang produktif, pengendalian hama dan penyakit, regulasi iklim, serta warisan dan rekreasi. Menurut Kajian Pollution to Solution, polusi plastik laut mengurangi layanan ekosistem laut berharga yang bernilai setidaknya US$500 miliar hingga US$2,500 miliar setiap tahunnya, dan itu tidak termasuk kerugian sosial dan ekonomi lainnya seperti pariwisata dan pengiriman."
    			},
    			{
    				p: "Kajian tersebut menyoroti bahwa kerugian ekonomi langsung terhadap industri pesisir dan maritim, seperti perikanan dan perkapalan, terjadi secara signifikan. Di kawasan Mediterania, kerugian ini diperkirakan mendekati US$138 juta per tahun. Di kawasan Kerjasama Ekonomi Asia Pasifik, kerugian total US$10,8 miliar, meningkat hampir sepuluh kali lipat dibandingkan tahun 2009. Namun, kerugian ini tidak dilaporkan dengan baik, dan biaya sebenarnya dari sampah laut dan polusi plastik pada manusia, lingkungan, dan kesehatan sosial masih dicari tahu."
    			}
    		]
    	},
    	{
    		type: "header",
    		head: "Plastik dan Perubahan Iklim",
    		video: "coral-polluted"
    	},
    	{
    		type: "pill",
    		short: "Rasio kura-kura jantan dan betina tidak seimbang?",
    		long: "Mikroplastik dapat meningkatkan suhu pasir di pantai tempat penyu bertelur. Mengingat suhu pasir menentukan jenis kelamin penyu, sarang yang lebih hangat ini dapat mengubah rasio penyu jantan dan betina yang menetas di pantai ini."
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Plastik juga merupakan masalah iklim. Tidak semua orang tahu bahwa plastik sebagian besar dihasilkan dari minyak, yakni bahan bakar fosil. Semakin banyak plastik yang kita buat, semakin banyak bahan bakar fosil yang dibutuhkan, semakin kita mengintensifkan krisis iklim dalam lingkaran umpan balik negatif yang terus-menerus. Selain itu, produk plastik menghasilkan emisi gas rumah kaca di seluruh siklus hidupnya. Jika tidak ada tindakan yang diambil, emisi gas rumah kaca dari produksi, daur ulang, dan pembakaran plastik dapat menyebabkan<a href=\"https://www.pewtrusts.org/-/media/assets/2020/07/breakingtheplasticwave_report.pdf\">19 persen dari total emisi yang diizinkan Perjanjian Paris pada tahun 2040</a> untuk membatasi pemanasan hingga 1,5 derajat Celcius."
    			},
    			{
    				p: "Dalam beberapa tahun terakhir, keniscayaan untuk melindungi laut dan samudra untuk mengatasi perubahan iklim kian meningkat. Laut adalah penyerap karbon terbesar di planet ini, menyimpan <a href=\"https://www.climate.gov/news-features/understanding-climate/climate-change-ocean-heat-content\"> sebanyak 90 persen panas tambahan yang telah terperangkap emisi karbon di atmosfer kita </a>  dan sepertiga dari karbondioksida tambahan yang dihasilkan sejak revolusi industri. Karbon yang diserap dalam jumlah yang besar telah memperlambat dampak yang terlihat dari planet yang memanas - tetapi juga mempercepat efek katastrofe di bawah permukaan air - lautan yang memanas, mengasamkan dan tidak seimbang secara kimiawi."
    			},
    			{
    				p: "Karbon mengalami sekuertasi pada setiap komponen lautan, terutama di hutan mangrove, padang lamun, karang, dan rawa asin. Semakin banyak kerusakan yang kita lakukan terhadap laut dan wilayah pesisir kita, semakin sulit bagi ekosistem ini untuk mengimbangi dan tetap tangguh terhadap perubahan iklim."
    			},
    			{
    				p: "Yang mengkhawatirkan, <a href=\"https://www.sciencedirect.com/science/article/abs/pii/S0048969721002886\"> suatu studi terbaru </a> tentang polusi plastik laut oleh GRID-Arendal, mitra UNEP, menunjukkan bahwa empat ekosistem pesisir yang menyimpan karbon paling banyak dan berfungsi sebagai penghalang alami terhadap naiknya permukaan air laut dan badai – mangrove, lamun, rawa garam dan terumbu karang – saat ini sedang menghadapi beban polusi plastik dari darat karena letaknya yang dekat dengan sungai. Dibandingkan dari yang sudah ada, saat ini survei dan penelitian sampah laut sangat penting untuk memprediksi konsekuensi dari tekanan, pendekatan mitigasi desain, dan adaptasi panduan."
    			}
    		]
    	},
    	{
    		type: "pill",
    		short: "Hutan mangrove yang sehat",
    		long: "<a href=\"https://www.sciencedaily.com/releases/2011/04/110404173247.htm\"> Hutan mangrove pesisir yang sehat menyimpan lebih banyak karbon per unit setara dengan hampir seluruh hutan lainnya di Bumi</a>."
    	},
    	{
    		type: "header",
    		head: "Dari Polusi Plastik ke Solusi",
    		video: "waste"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Polusi yang merajalela, kerusakan keanekaragaman hayati, dan ketidakstabilan iklim adalah krisis planet yang paling mendesak di zaman kita. Pertumbuhan produksi plastik yang cepat sudah menimbulkan ancaman bagi sistem alam Bumi, di mana kehidupan bergantung, dan diproyeksikan akan menjadi lebih buruk. Pada tahun 2040, sampah plastik diperkirakan akan menghadirkan risiko keuangan tahunan sebesar US $ 100 miliar untuk bisnis guna menanggung biaya pengelolaan limbah pada volume yang diinginkan. Diperkirakan bahwa <a href=\"https://www.eionet.europa.eu/etcs/etc-wmge/products/impact-of-covid-19-on-single-use-plastics-and-the-environment-in-europe\" target=\"_blank\"> di Italia saja, antara 160.000 dan 440.000 metrik ton limbah tambahan</a>  diproduksi pada tahun 2020 karena ketergantungan yang meningkat pada peralatan medis <strong>protektif selama pandemi Covid-19 </strong>. Jika hanya 1 persen dari masker sekali pakai yang berkontribusi pada angka ini dibuang dengan tidak benar, bisa jadi sampai dengan 10 juta masker mungkin masuk dan mencemari laut per bulan."
    			},
    			{
    				p: "Walaupun jumlah plastik di laut yang perlu kita atasi begitu besar hingga sulit untuk dimengerti, sains memberitahu kita bahwa sebagian besar solusi yang kita butuhkan sudah ada. Banyak kegiatan regional, nasional, dan lokal yang membantu mengurangi aliran plastik ke laut, seperti Konvensi Laut Regional, larangan nasional terhadap produk plastik sekali pakai, <a href=\"https://ellenmacarthurfoundation.org/topics/the-global-commitment/overview\"> komitmen </a> bisnis dan pemerintah untuk mengurangi, mendesain ulang dan menggunakan kembali produk plastik, meningkatkan jumlah plastik daur ulang dalam produk baru, inisiatif di jalanan, dan larangan kota untuk penggunaan tas plastik sekali pakai."
    			},
    			{
    				p: "\"<a href=\"https://www.pewtrusts.org/en/research-and-analysis/articles/2020/07/23/breaking-the-plastic-wave-top-findings\" target=\"_blank\">Breaking the Plastic Wave </a>\", \", suatu analisis global tentang bagaimana mengubah lintasan sampah plastik, mengungkapkan bahwa kita dapat mengurangi jumlah plastik yang masuk ke laut sekitar 80 persen dalam dua dekade mendatang jika kita memanfaatkan teknologi dan solusi yang sudah ada."
    			},
    			{
    				p: "Melanjutkan bisnis seperti biasa bukanlah pilihan. Kajian \" Pollution to Solution\" menjelaskan bahwa skala masalah membutuhkan komitmen dan tindakan mendesak di tingkat global, di seluruh siklus hidup plastik dan dari sumbernya hingga ke laut untuk mencapai pengurangan limbah jangka panjang yang diperlukan."
    			}
    		]
    	},
    	{
    		type: "big-text",
    		text: [
    			{
    				illo: "small-illos-02",
    				p: "Meningkatkan sistem pengelolaan sampah sehingga infrastruktur yang tepat tersedia untuk menerima sampah plastik dan untuk memastikan jumlah sampah plastik yang tinggi dapat digunakan kembali atau didaur ulang."
    			},
    			{
    				illo: "small-illos-03",
    				p: "Meningkatkan sirkularitas dengan mempromosikan praktik konsumsi dan produksi yang lebih berkelanjutan di seluruh rantai nilai sampah plastik."
    			},
    			{
    				illo: "small-illos-04",
    				p: "Melibatkan konsumen dalam mengatasi polusi plastik untuk memengaruhi pasar dan untuk menginspirasi perubahan perilaku."
    			},
    			{
    				illo: "small-illos-05",
    				p: "Mengontrol jumlah sampah plastik dengan menyingkirkan barang-barang plastik yang tidak diperlukan, dapat dihindari, dan paling bermasalah serta menggantinya dengan bahan, produk, dan layanan alternatif."
    			},
    			{
    				illo: "small-illos-06",
    				p: "Bertanggung jawab pada dampak yang ditinggalkan sampah plastik melalui pemantauan yang efektif untuk mengidentifikasi sumber, jumlah dan wujud akhir dari sampah plastik."
    			},
    			{
    				illo: "small-illos-07",
    				p: "Meningkatkan dan memperkuat tata kelola di semua tingkatan."
    			},
    			{
    				illo: "small-illos-08",
    				p: "Meningkatkan pengetahuan dan memantau efektivitas dalam menerapkan penelitian ilmiah yang mendalam"
    			},
    			{
    				illo: "small-illos-09",
    				p: "Meningkatkan keuangan dengan dukungan teknis dan peningkatan kapasitas."
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Beberapa kesepakatan dan konvensi internasional yang ada telah memberikan dukungan untuk mengurangi polusi dan sampah laut, mengatasi perubahan iklim (SDG 13), dan pemanfaatan laut secara berkelanjutan (SDG 14). The Global Partnership on Marine Litter, The United Nations Convention on the Law of the Sea dan The Convention on Biological Diversity secara langsung berkaitan dengan kesehatan laut, ekosistemnya, dan kehidupan laut. Konvensi Basel, Stockholm dan Rotterdam berkaitan dengan pergerakan dan pembuangan limbah dan bahan kimia berbahaya.  Ada pula momentum yang berkembang untuk terciptanya suatu kesepakatan global potensial tentang sampah  laut dan polusi plastik guna mengatasi momok ini."
    			},
    			{
    				p: "Tidak ada solusi tunggal. Seperti halnya dengan aneka beban lingkungan antargenerasi lainnya, solusi ini membutuhkan sistem pemikiran, inovasi, dan transformasi. Meski demikian, tujuannya satu: mengurangi plastik yang tidak diperlukan, mengurangi plastik yang dapat dihindari dan menjadi masalah, serta menghentikan alirannya ke danau, sungai, lahan basah, pantai, dan laut. Kita semua dalam hal ini bersama-sama, dan bersama-sama, kita bisa, kita harus, memecahkan sampah laut dan masalah polusi plastik."
    			}
    		]
    	},
    	{
    		type: "download",
    		head: "Unduh laporan UNEP: Dari Polusi ke Solusi: suatu kajian global tentang sampah laut dan polusi plastik",
    		cover: "cover",
    		other: "Sumber lain (infografik)",
    		downloadlink: "https://wedocs.unep.org/xmlui/bitstream/handle/20.500.11822/36963/POLSOL.pdf",
    		furtherlink: "https://www.unep.org/resources/pollution-solution-global-assessment-marine-litter-and-plastic-pollution",
    		further: "Sumber lainnya"
    	},
    	{
    		type: "footer",
    		head: "Bergabunglah bersama UNEP dalam mengambil tindakan sekarang!",
    		text: [
    			{
    				p: "<a href=\"https://www.unep.org/environmentassembly/about-united-nations-environment-assembly\"> United Nations Environment Assembly </a> (UNEA) adalah badan pembuat keputusan tertinggi di dunia tentang lingkungan, dengan keanggotaan universal dari semua 193 Negara Anggota. Majelis menetapkan prioritas untuk kebijakan lingkungan global, mengembangkan hukum lingkungan internasional, menyediakan kepemimpinan, mengkatalisis tindakan antar pemerintah pada lingkungan, dan berkontribusi pada pelaksanaan <a href=\"https://sustainabledevelopment.un.org/\">UN 2030 Agenda for Sustainable Development</a>. Kajian penting ini akan mendesak pemerintah pada UNEA-5.2 berikutnya pada Februari 2022, untuk mengambil tindakan yang menentukan, aksi global dalam mengatasi krisis plastik. Akreditasi dengan UN Environment Programme akan memungkinkan anda untuk berpartisipasi. Organisasi-organisasi didorong untuk mengirim permintaan akreditasi dengan segera agar dapat diproses tepat waktu. Cari tahu lebih lanjut <a href=\"https://www.unep.org/civil-society-engagement/accreditation\">disini </a>."
    			},
    			{
    				p: "Berakar dari kinerja jangka panjang UNEP dan <a href=\"https://unep-marine-litter.vercel.app/\"> Global Partnership on Marine Litter (GPML), the <a href=\"https://www.cleanseas.org/\">Clean Seas Campaign telah mengkoneksikan dan mengumpulkan individu, kelompok masyarakat sipil, industri dan pemerintah untuk mengkatalisis perubahan dan mengubah kebiasaan, praktik, standar dan kebijakan di seluruh dunia untuk secara dramatis mengurangi sampah laut dan dampak negatifnya. Hingga saat ini, 63 negara telah bergabung, dan lebih dari seratus ribu orang telah terlibat kampanye melalui ikrar tindakan, komitmen dan interaksi media sosial. Cari tahu bagaimana cara bergabung dan membuat ikrar #CleanSeas <a href=\"https://www.cleanseas.org/make-pledge\">disini</a>."
    			},
    			{
    				p: "<a href=\"https://www.gpmarinelitter.org/\">Global Partnership on Marine Litter</a> (GPML)  menyatukan semua aktor yang bekerja pada sampah laut serta pencegahan dan pengurangan polusi plastik. Semua entitas yang bekerja untuk mengatasi masalah global yang mendesak ini, diundang untuk bergabung dengan GPML <a href=\"https://www.gpmarinelitter.org/who-we-are/members/sign-up\"> disini </a>. Platform Digital GPML adalah platform open-source dan platform multi-stakeholder yang mengkompilasi sumber daya yang berbeda, menghubungkan pemangku kepentingan dan mengintegrasikan data untuk memandu tindakan, dengan tujuan mempromosikan akses yang adil pada data, informasi, teknologi dan inovasi. Cari tahu lebih lanjut dan bergabunglah <a href=\"https://digital.gpmarinelitter.org/\">di sini</a>!!"
    			},
    			{
    				p: "<a href=\"https://ellenmacarthurfoundation.org/topics/the-global-commitment/overview\">The New Plastics Economy Global Commitment</a>menyatukan bisnis, pemerintah, dan organisasi lain di sepanjang rantai nilai plastik di belakang <a href=\"https://emf.thirdlight.com/link/86tanzqdbppx-8rdpns/@/preview/1?o\">visi bersama</a> dan target untuk mengatasi limbah plastik dan polusi dari sumbernya. Hal ini dipimpin oleh <a href=\"https://ellenmacarthurfoundation.org/\">Ellen MacArthur Foundation </a>bekerja sama dengan <a href=\"https://www.unep.org/\">UNEP </ a>. Para pemberi tanda tangan berkomitmen untuk mengambil tindakan khusus untuk MENGELIMINASI plastik yang tidak kita butuhkan; BERINOVASI untuk memastikan bahwa produk plastik yang kita butuhkan dapat digunakan kembali, dapat didaur ulang, atau dapat dibuat kompos; dan MENSIRKULASIKAN semua barang plastik yang kita gunakan agar tetap bisa dimanfaatkan dan tidak mencemari lingkungan."
    			},
    			{
    				p: "<a href=\"https://www.oneplanetnetwork.org/sustainable-tourism/global-tourism-plastics-initiative\"> Global Tourism Plastics Initiative (GTPI) adalah penghubung dari Komitmen Global dengan sektor Pariwisata. Lebih dari 600 organisasi termasuk 20 pemerintah dari seluruh dunia dan lebih dari 350 bisnis yang mewakili lebih dari 20 persen kemasan plastik yang digunakan secara global merupakan para pemberi tanda tangan Komitmen Global dan GTPI."
    			},
    			{
    				p: "<a href=\"https://www.oneplanetnetwork.org/one-planet-network-wide-plastics-initiative\"> One Planet Network-Wide Plastics Initiative</a> mempromosikan tindakan seluruh narasi umum yang dibangun berdasarkan bukti dan pengetahuan yang diproduksi oleh UNEP, sembari memanfaatkan keahlian dan kemitraan yang berbeda dalam program jejaring One Planet. Kemasan plastik di tahap penggunaan dalam rantai nilai plastik adalah titik masuk utama untuk membingkai respons kolektif di jejaring."
    			}
    		]
    	}
    ];
    var resources$4 = [
    ];
    var menu$6 = [
    	{
    		item: "Unduh laporan",
    		short: "Unduh",
    		link: "https://wedocs.unep.org/xmlui/bitstream/handle/20.500.11822/36963/POLSOL.pdf"
    	}
    ];
    var meta$6 = {
    	title: "Dari Polusi ke Solusi",
    	url: "unep.org/interactive/pollution-to-solution",
    	description: "Suatu kajian saksama terhadap berbagai ancaman kesehatan, ekonomi, ekosistem, satwa liar serta iklim dan solusi yang terkait dengan sampah laut dan polusi plastik.",
    	keywords: "Plastik di Pantai, Laut Bersih, Polusi Laut, Polusi Plastik, Sampah di Laut, Sampah Plastik, Sumber Polusi Air"
    };
    var storyID = {
    	article: article$5,
    	resources: resources$4,
    	menu: menu$6,
    	meta: meta$6
    };

    var article$4 = [
    	{
    		type: "intro",
    		head: "من التلوث<br/> <b>إلى الحلّ</b>",
    		video: "intro",
    		text: [
    			{
    				p: "ما القاسم المشترك بين أعمق نقطة في المحيط، <b>أخدود ماريانا</b>، وأعلى قمة جبلية في العالم،<b>. قمّة إيفرست</b>؟"
    			},
    			{
    				p: "على الرغم من كونهما من بين أكثر البيئات النائية التي يتعذر الوصول إليها على كوكب الأرض، <b>إلا أنهما يحتويان على قطع بلاستيكية صغيرة جرَّاء النشاط البشري القائم</b> على بُعد أميال."
    			},
    			{
    				p: "<b>تُشكّل المواد البلاستيكية</b> الجزء الأكبر من القمامة البحرية وأكثرها ضرراً وبقاءً، وتُمثّل على الأقل <b>85 في المائة من إجمالي حجم النفايات البحرية</b>."
    			},
    			{
    				p: "توجد النفايات البحرية <b>بكميات متزايدة</b> على طول سواحلنا وفي الخيران، وفي التيارات الدوَّاميّة الهائلة وسط المحيط، وفي الجزر النائية وفي الجليد البحري..."
    			},
    			{
    				p: "... وقاع البحر بدءاً من المناطق القطبية ووصولاً إلى أعمق الأخاديد وأكثرها ظلمة، <b>لتضرُّ بالحياة البحرية</b> وتدمِّر الموائل على طول مسارها."
    			}
    		]
    	},
    	{
    		type: "series",
    		tag: "هذه القصة هي جزءٌ من سلسلة صادرة عن برنامج الأمم المتحدة للبيئة تعرض الطريقة التي يمكن للبشرية من خلالها أن تعيش في تناغم أكثر مع الطبيعة في كوكبٍ خالٍ من التلوّث ومستقر مناخياً.",
    		kicker: "قصص إضافية من السلسلة",
    		stories: [
    			{
    				item: "الحياة تحت سطح الماء",
    				link: "https://www.unep.org/interactive/status-world-coral-reefs/"
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "على مدار الأعوام الـ 70 الماضية، تسلَّلت المواد البلاستيكية - وهي مادة مرنة ومتعددة الاستخدامات ومتينة على نحو مُذهل - إلى السوق وتغلغلت على ما يبدو في كل زاوية وركن على وجه الأرض. يمكن الاستفادة من البلاستيك في استخدامات هامّة، من الأجهزة الطبية التي تساهم في إنقاذ حياة البشر إلى تخزين الطعام بصورة آمنة ولفترة طويلة. ومع ذلك، فإنّ المنتجات البلاستيكية غير الضرورية التي يمكن تجنبها، وبخاصةٍ مواد التغليف التي تُستخدم لمرة واحدة والأشياء التي يمكن التخلص منها، تلوِّث كوكبنا بمعدلات تنذر بالخطر. لقد أدَّت عقود من النمو الاقتصادي والاعتماد المتزايد على التخلص من المنتجات البلاستيكية إلى وجود سيل من النفايات غير المُدارة التي تصب في البحيرات والأنهار والبيئات الساحلية، ثم ينتهي بها المطاف أخيراً في البحر، مما يتسبب في سلسلة من المشاكل."
    			},
    			{
    				p: "<strong><a href=\"\">من التلوث إلى الحلّ: يُظهر تقييم عالمي للقمامة البحرية والتلوث البلاستيكي</a></strong> وجود تهديد متنامٍ في جميع النُّظم البيئية ينتقل من المصدر إلى البحر. كما يوضح أننا مع امتلاكنا للمعرفة المطلوبة، نحتاج إلى الإرادة السياسية والعمل العاجل من قِبل الحكومات للتصدي للأزمة المتصاعدة. وسيثري التقرير الإجراءات ذات الأولوية في جمعية الأمم المتحدة للبيئة (الدورة 5، الجلسة 2) المقرر عقدها في عام 2022، حيث ستجتمع البلدان معاً لتحديد طريقة للمضي قدماً في جهود التعاون على الصعيد العالمي. ويُحذِّر تقييم الأمم المتحدة الجديد من أنه ما لم نتعامل مع مشكلة نفاياتنا البلاستيكية:"
    			}
    		]
    	},
    	{
    		type: "scrolly-video",
    		video: "litter",
    		text: [
    			{
    				p: "فإنه بدون اتخاذ إجراء عاجل، سوف تتضاعف الكمية المقدرة بـ 11 مليون طن متري من البلاستيك التي تُلقى حالياً في المحيط كل سنة بمقدار ثلاث مرات في السنوات العشرين المقبلة."
    			},
    			{
    				p: "وهذا يعني تدفُّق ما بين 23 و37 مليون طن متري من البلاستيك إلى المحيط كل عام بحلول عام 2040."
    			},
    			{
    				p: "وهذا يعادل 50 كيلوغراماً من النفايات البلاستيكية لكل متر واحد من الخط الساحلي في جميع أنحاء العالم..."
    			},
    			{
    				p: "... أو بوزن يصل إلى 178 سفينة مثل سفينة \"سيمفوني أوف ذا سيز\"، أكبر سفينة سياحية في العالم."
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "تطورت المشكلة إلى أزمة عالمية تتطلب الاهتمام والعمل الفوري والمستمر. ويُشكّل هذا التقييم نداءً نهائياً للتنبُّه بشأن انتشار القمامة البحرية في كل مكان والآثار الضارة للتلوث البلاستيكي - من التدهور البيئي إلى الخسائر الاقتصادية للمجتمعات والصناعات والمخاطر على صحة الإنسان - ويوضح لنا كيف يمكننا القيام بعمل أفضل. لقد حان الوقت الآن لنتكاتف من أجل تحويل مجرى الأمور بشأن النفايات البحرية والتلوث البلاستيكي من خلال تنفيذ الحلول المتعددة الميسَّرة - الكبيرة والصغيرة – على وجه السرعة وبشيء من الابتكار والالتزام والمساءلة."
    			}
    		]
    	},
    	{
    		type: "pill",
    		short: "ما مدى صغر الجسيمات البلاستيكية الدقيقة والجسيمات البلاستيكية النانوية؟",
    		long: "الجسيمات البلاستيكية الدقيقة والجسيمات البلاستيكية النانوية عبارة عن قطع بلاستيكية يتراوح طولها بين 5 مليمترات وأقل من بضعة نانومترات."
    	},
    	{
    		type: "text",
    		head: "الإضرار بالحياة البحرية",
    		text: [
    			{
    				p: "تُعدّ النفايات البحرية والتلوث البلاستيكي مشكلةً لأسباب كثيرة. فالبلاستيك لا يتحلل بيولوجياً (التحلل بشكلٍ طبيعي وعلى نحو لا يضر بالبيئة). وبدلاً من ذلك، فإنها تتفكك بمرور الوقت إلى قطع أصغر تُعرف باسم الجسيمات البلاستيكية الدقيقة والجسيمات البلاستيكية النانوية، والتي يمكن أن يكون لها تأثيرات ضارة كبيرة."
    			},
    			{
    				p: "تتراوح التأثيرات على الحياة البحرية من الضرر المادي أو الكيميائي الذي يلحق بالحيوانات، إلى تأثيرات أوسع نطاقاً على التنوع البيولوجي ووظائفية النظام الإيكولوجي. وقد عُثِر على قطع من البلاستيك في الجهاز الهضمي لكثير من الكائنات المائية، بما في ذلك في كل أنواع السلاحف البحرية وما يقرب من نصف جميع أنواع الطيور البحرية والثدييات البحرية التي جرى مسحها."
    			}
    		]
    	},
    	{
    		type: "scrolly-video",
    		video: "harm_to_animals",
    		text: [
    			{
    				p: "تخطئ السلاحف البحرية في التمييز بين الأكياس البلاستيكية العائمة وقناديل البحر، وبالتهامها تتعرض للتضور جوعاً ببطء حيث تمتلئ بطونها بالنفايات غير القابلة للهضم."
    			},
    			{
    				p: "تلتقط الطيور البحرية المواد البلاستيكية بمنقارها لأنّ <a href=\"https://www.nature.com/articles/376680a0.epdf?sharing_token=XzA3pMyq1-90bp8IHPsDiNRgN0jAjWel9jnR3ZoTv0NjqwHPzT2EZOmoupSkNogAcZGDea6VHenadcy2ZVTQLAQygdRw7H4UC7py46oKWTeTp_jR-LXk4EUiQD6fCfvgRxa9FeT2BsqDP4gNHAHc1UOJNEfRsAF6L4Fzte3kHmnRcOOaeLbB7-DtdeGWOnUkVs0C8l8RNzNyQal8GyWw8jg93siTVTmEMCZPcazH8Z6Ugd6g-RzwR2_TN5PgL8qQP1k1RCdu4pqP8R7_z_ucaoN-S1AoVv52tqlLZZR6c5k%3D&amp;tracking_referrer=www.scientificamerican.com\"> لها رائحة ومظهر يشبه الطعام</a>."
    			},
    			{
    				p: "غالباً ما تغرق الثدييات البحرية والسلاحف البحرية وغيرها من الحيوانات بعد أن تعلَق وسط <a href=\"https://www.fisheries.noaa.gov/alaska/marine-life-distress/pinniped-entanglement-marine-debris\">المواد البلاستيكية المفقودة أو المهملة</a> بما في ذلك مواد التعبئة والتغليف أو معدات الصيد."
    			},
    			{
    				p: "يتمثل أحد الأسباب الرئيسية في وفاة <a href=\"https://www.fisheries.noaa.gov/species/north-atlantic-right-whale\">حيتان القطب الشمالي</a>، وهي من بين أشدّ الحيتان المهددة بالانقراض في العالم، في وقوعها في شرك معدات الصيد العرضي."
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "هناك تأثيرات أقل وضوحاً من ذلك أيضاً. إذ لا يقتصر تأثير السموم الموجودة بالفعل في البلاستيك على شبكة الغذاء في المحيطات فحسب، وإنما يُعرف أيضاً أنّ القطع البلاستيكية تمتص الملوثات التي تتدفق من اليابسة إلى البحر، بما في ذلك النفايات الصيدلانية والصناعية. ويمكن أن تنتقل السمية عبر السلسلة الغذائية، حيث تأكل الأنواع البحرية وتؤكل. وهناك قلقٌ متزايد أيضاً بشأن الأنواع غير المحلية التي تقطع رحلتها عبر المحيط فوق القمامة العائمة إلى بحارٍ وتربةٍ أجنبية، كالطحالب والرخويات والبرنقيل، والتي يمكن أن تغزو وتدمر البيئات المائية البعيدة والأنواع الأخرى. وتتفاقم المشكلة نظراً لأنّ معظم القمامة البلاستيكية في المحيط تغرق في نهاية المطاف إلى قاع البحر مثل كومة من القمامة المغمورة، مما يؤدي إلى اختناق الشعاب المرجانية والحياة البحرية في الأسفل عند القاع."
    			}
    		]
    	},
    	{
    		type: "illo",
    		illo: "woman"
    	},
    	{
    		type: "text",
    		head: "الإضرار بالبشر",
    		text: [
    			{
    				p: "يتعرض البشر أيضاً لخطر التلوث بالقمامة البحرية والتلوث البلاستيكي. إذ ترتبط صحة البيئة ارتباطاً وثيقاً بصحة الإنسان. ويثير انتشار الجسيمات البلاستيكية الدقيقة في جميع أنحاء كوكبنا مخاوف جدية بشأن سلامة الناس؛ إذ يُظهر <a href=\"https://www.acs.org/content/acs/en/pressroom/newsreleases/2020/august/micro-and-nanoplastics-detectable-in-human-tissues.html\">بحث جديد</a> أن الناس يستنشقون الجسيمات البلاستيكية الدقيقة عن طريق الهواء ويستهلكونها من خلال الطعام والماء بل ويمتصونها عبر الجلد. كما عُثِر على جسيمات بلاستيكية دقيقة داخل <strong>أجسادنا في الرئتين والكبد والطحال والكلى</strong>، ووَجدت إحدى الدراسات مؤخراً جسيمات بلاستيكية دقيقة في <strong>مشيمة </strong> أطفال حديثي الولادة."
    			},
    			{
    				p: "لا يزال النطاق الكامل للتأثيرات على صحة الإنسان غير معروف إذ أن البحث لا يزال في طور البداية. غير أن هناك أدلة قوية على أن المواد الكيميائية المرتبطة بالبلاستيك، مثل ميثيل الزئبق والملدنات ومثبطات اللهب، يمكن أن تدخل الجسم وترتبط بمخاوف صحية، خاصة عند النساء. يعتقد العلماء أيضاً أن بعض المواد الكيميائية الشائعة الموجودة في البلاستيك، مثل ثنائي الفينول أ، والفثالات، وثنائي الفينيل المتعدد الكلور، يمكن أن تتسرب إلى الجسم. ترتبط هذه المواد الكيميائية باضطراب الغدد الصماء واضطرابات النمو والتشوهات التناسلية والسرطان. وهذا سبب كافٍ لاعتماد نهج احترازي."
    			}
    		]
    	},
    	{
    		type: "pill",
    		short: "حظرت الصين استيراد معظم النفايات البلاستيكية",
    		long: "في عام 2018، حظرت الصين استيراد معظم النفايات البلاستيكية للمساعدة في تحسين البيئة وجودة الهواء والاقتصاد داخل حدودها إذ انتهى المطاف بمعظم القمامة في مطامر القمامة أو في المجاري المائية والتربة."
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "آثار التلوث البلاستيكي غير محسوسة على نحوٍ متساوٍ حول أنحاء العالم. فأكثر البُلدان ثراءً تُنتج نفايات بلاستيكية أكثر، وتتدفق كلها في كثير من الأحيان إلى أقل البُلدان نمواً حيث تكون إدارة النفايات هي أقلّها تعقيداً. ويمكن أن تساعد إعادة التدوير في تقليل إنتاج البلاستيك والنفايات البلاستيكية؛ بيْد أن المشكلة الرئيسية هي انخفاض معدل إعادة تدوير البلاستيك في جميع أنحاء العالم، والذي يقل حالياً عن 10 في المائة."
    			},
    			{
    				p: "تُعدّ المجتمعات المحلية في البُلدان النامية الأقل قدرة على إدارة العبء البيئي والصحي والاجتماعي والثقافي للتلوث البلاستيكي بسبب نقص الدعم الحكومي أو التمويل. ويعني ذلك أن النساء والأطفال وعمال النفايات والمجتمعات الساحلية والشعوب الأصلية والأشخاص الذين يعتمدون على المحيط <a href=\"https://www.unescap.org/sites/default/files/publications/CS76%20Theme%20Study.pdf\">يشعرون بالتأثيرات بشكلٍ أكبر</a>، لا سيما عند نقل أو حرق النفايات التي تُدار بشكلٍ سيئ. ويعني ذلك أيضاً أن هذه الاقتصادات تعاني بسبب اختناقها بالمواد البلاستيكية."
    			},
    			{
    				p: "تؤثر المواد البلاستيكية البحرية سلباً على قدرة عدد لا يحصى من النُّظم الإيكولوجية على توفير الفوائد الأساسية التي يتمتع بها البشر ويتخذونها أمراً مسلّماً به على حد سواء، وتتراوح بين المياه النظيفة وتربية الأحياء المائية ومصائد الأسماك المنتجة ومكافحة الآفات والأمراض وتنظيم المناخ والتراث وأنشطة الاستجمام. وحسب ’تقييم الحل لمشكلة التلوث‘، يعمل التلوث البحري بالمواد البلاستيكية على تقليل خدمات النُّظم الإيكولوجية البحرية القيّمة بمقدار 500 مليار إلى 2500 مليار دولار أمريكي سنوياً على الأقل، ولا يشمل ذلك الخسائر الاجتماعية والاقتصادية الأخرى كالسياحة والشحن."
    			},
    			{
    				p: "يُسلِّط التقييم الضوء على أن الخسائر الاقتصادية المباشرة التي تتعرض لها الصناعات الساحلية والبحرية، مثل مصائد الأسماك والشحن، كبيرة للغاية. ففي منطقة البحر الأبيض المتوسط، قُدِّرت هذه الخسائر بما يقرب من 138 مليون دولار أمريكي في السنة. وفي منطقة التعاون الاقتصادي لبلدان آسيا والمحيط الهادئ، بلغ إجمالي الخسائر 10.8 مليار دولار أمريكي، أي ما يقرب من عشرة أضعاف مقارنة بعام 2009. ومع ذلك، لم تُرفع تقارير جيدة بشأن هذه الخسائر، وما زلنا بصدد اكتشاف التكاليف الحقيقية للقمامة البحرية وللتلوث البلاستيكي على الصحة البشرية والبيئية والاجتماعية."
    			}
    		]
    	},
    	{
    		type: "header",
    		head: "البلاستيك وتغيُّر المناخ",
    		video: "coral-polluted"
    	},
    	{
    		type: "pill",
    		short: "هل نشهد خللاً في توازن نسبة السلاحف الذكور إلى الإناث؟",
    		long: "يمكن أن ترفع الجسيمات البلاستيكية الدقيقة درجة حرارة الرمال على الشواطئ حيث تعيش السلاحف البحرية. ونظراً لأن درجة حرارة الرمال تحدد جنس السلاحف، فإنّ هذه الأعشاش الأكثر دفئاً قد تُغيّر نسبة السلاحف الذكور والإناث التي تفقس على هذه الشواطئ."
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "تُعدّ المواد البلاستيكية أيضاً مشكلةً مناخية. فليس الجميع يعلمون أن البلاستيك يُنتَج من النفط، وهو وقود أحفوري. وكلما زاد عدد منتجاتنا من البلاستيك، تطلَّب الأمر مزيداً من الوقود الأحفوري، وزاد تكثيفنا لأزمة المناخ في متتالية ردود فعل سلبية مستمرة. كذلك، ينتج عن المنتجات البلاستيكية انبعاثات من غازات الاحتباس الحراري عبر كامل دورة حياتها. فإذا لم يُتخذ أي إجراء، قد تمثّل انبعاثات غازات الاحتباس الحراري الناجمة عن إنتاج البلاستيك وإعادة تدويره وحرقه نسبة <a href=\"https://www.pewtrusts.org/-/media/assets/2020/07/breakingtheplasticwave_report.pdf\">19 في المائة من إجمالي الانبعاثات المسموح بها في اتفاق باريس في عام 2040</a> للحد من ارتفاع درجة الحرارة بمقدار 1.5 درجة مئوية."
    			},
    			{
    				p: "في السنوات الأخيرة، ظهرت ضرورة متزايدة لحماية المحيطات والبحار لمواجهة تغيُّر المناخ. فالمحيط هو أكبر بالوعة كربون على كوكب الأرض، حيث يُخزِّن <a href=\"https://www.climate.gov/news-features/understanding-climate/climate-change-ocean-heat-content\"> ما يصل إلى 90 في المائة من الحرارة الإضافية التي احتجزتها انبعاثات الكربون في غلافنا الجوي</a> وثلث ثاني أكسيد الكربون الإضافي المتولد منذ الثورة الصناعية. وقد أدى امتصاص كميات كبيرة من الكربون إلى إبطاء التأثيرات المرئية لارتفاع درجة حرارة كوكب الأرض - لكنه أدى أيضاً إلى تسريع الآثار الكارثية تحت سطح الماء - مما أدى إلى ارتفاع درجة حرارة المحيط وتحمّضه واختلال توازنه كيميائياً."
    			},
    			{
    				p: "يُعزل الكربون في كل مكون من مكونات المحيط، وخاصة في أشجار القِرَم (المنغروف) والأعشاب البحرية والشعاب المرجانية والمستنقعات المالحة. وكلما زاد الضرر الذي نلحقه بمحيطاتنا ومناطقنا الساحلية، كان من الصعب على هذه النظم الإيكولوجية موازنة تغيُّر المناخ والحفاظ عليه."
    			},
    			{
    				p: "وعلى نحو مثير للقلق، أشارت <a href=\"https://www.sciencedirect.com/science/article/abs/pii/S0048969721002886\">دراسة حديثة</a> عن التلوث البحري بالبلاستيك أجرتها قاعدة بيانات الموارد العالمية - أريندال (GRID-Arendal)، شريك برنامج الأمم المتحدة للبيئة، إلى أن النُّظم البيئية الساحلية الأربعة التي تخزن معظم الكربون وتعمل باعتبارها حواجز طبيعية ضد ارتفاع البحار والعواصف - وهي أشجار المنغروف والأعشاب البحرية والمستنقعات المالحة والشعاب المرجانية - تتعرض لضغوط ناجمة عن التلوث البري بالبلاستيك نتيجة لقربها من الأنهار. وتعد عمليات المسح والبحوث المتعلقة بالقمامة البحرية ضرورية الآن أكثر من أي وقت مضى للتنبؤ بعواقب الضغوط وتصميم مناهج التخفيف وتوجيه مساعي التكيف."
    			}
    		]
    	},
    	{
    		type: "pill",
    		short: "غابات المنغروف الصحية",
    		long: "<a href=\"https://www.sciencedaily.com/releases/2011/04/110404173247.htm\">تُخزِّن غابات المنغروف الساحلية الصحية كمية من الكربون لكل وحدة مساحة أكثر من أي غابة أخرى على الأرض تقريباً</a>."
    	},
    	{
    		type: "header",
    		head: "من التلوث بالمواد البلاستيكية إلى الحلّ",
    		video: "waste"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "يعدُّ التلوث بالمواد البلاستيكية وانهيار التنوع البيولوجي وعدم استقرار المناخ من أكثر أزمات الكواكب إلحاحاً في عصرنا. فالنمو السريع في إنتاج البلاستيك يشكّل بالفعل تهديدات للأنظمة الطبيعية للأرض والتي تعتمد عليها الحياة، ولا يُتوقع لها إلا أن تشتدّ سوءاً. وبحلول عام 2040، من المتوقع أن تفرض النفايات البلاستيكية مخاطر مالية سنوية قدرها 100 مليار دولار أمريكي بالنسبة إلى الشركات التي قد تحتاج إلى تكبد تكاليف إدارة النفايات بالأحجام المتوقعة. وفي إيطاليا وحدها، أشارت التقديرات إلى أنّ <a href=\"https://www.eionet.europa.eu/etcs/etc-wmge/products/impact-of-covid-19-on-single-use-plastics-and-the-environment-in-europe\" target=\"_blank\">ما يتراوح بين 160.000 و440.000 طن متري من النفايات الإضافية</a> قد أُنتج في عام 2020 نتيجة الاعتماد المكثّف على <strong>المعدات الوقائية الطبية في إبان جائحة كوفيد-19</strong>. وإذا جرى التخلص بطريقة غير ملائمة من 1 في المائة فقط من الكمامات التي تستخدم لمرة واحدة والتي تساهم في هذا الرقم، فقد يُلقى ما يصل إلى 10 ملايين كمامة في المحيط شهرياً وتؤدي إلى تلويثه."
    			},
    			{
    				p: "في حين أن كمية المواد البلاستيكية البحرية التي يتعيّن علينا أن نعالجها هي كبيرة جداً ويصعُب إدراكها، يخبرنا العلم أن معظم الحلول التي نحتاج إليها موجودة بالفعل. فهناك عدد من الأنشطة على الأصعدة الإقليمية والوطنية والمحلية تساعد في الحد من تدفق المواد البلاستيكية إلى المحيط، مثل اتفاقيات البحار الإقليمية، والحظر الوطني على المنتجات البلاستيكية ذات الاستخدام الواحد، <a href=\"https://ellenmacarthurfoundation.org/topics/the-global-commitment/overview\">والتزامات الشركات والحكومة</a> بالحد من المنتجات البلاستيكية وإعادة تصميمها وإعادة استخدامها، وزيادة محتوى البلاستيك المعاد تدويره في المنتجات الجديدة، ومبادرات استلام المنتجات داخل السيارة، وحظر أكياس البلدية."
    			},
    			{
    				p: "إنّ الاستمرار في العمل كالمعتاد لم يعد ببساطة من بين الخيارات المتاحة. فالتقييم المعنون «من التلوث إلى الحلّ» يبيِّن بوضوح أنّ حجم المشكلة يتطلب التزامات وإجراءات عاجلة على الصعيد العالمي عبر دورة حياة البلاستيك ومن المصدر إلى البحر لتحقيق الخفض الضروري الطويل الأجَل للنفايات."
    			}
    		]
    	},
    	{
    		type: "big-text",
    		text: [
    			{
    				illo: "small-illos-02",
    				p: "تحسين نُظُم إدارة النفايات بحيث تتوفر البنية التحتية المناسبة لاستقبال النفايات البلاستيكية وضمان إعادة استخدامها أو تدويرها."
    			},
    			{
    				illo: "small-illos-03",
    				p: "تعزيز التدوير من خلال تعزيز ممارسات استهلاك وإنتاج أكثر استدامة عبر سلسلة القيمة الخاصة بالبلاستيك كاملةً."
    			},
    			{
    				illo: "small-illos-04",
    				p: "إشراك المستهلكين في معالجة التلوث بالمواد البلاستيكية للتأثير في السوق وإلهامهم بالتغيير السلوكي."
    			},
    			{
    				illo: "small-illos-05",
    				p: "إغلاق الصنبور بالتخلّي التدريجي عن العناصر البلاستيكية غير الضرورية التي يمكن تجنبها والتي تسبب قدراً كبيراً من المشاكل مع استبدالها بمواد ومنتجات وخدمات بديلة."
    			},
    			{
    				illo: "small-illos-06",
    				p: "التعامل مع الإرث الحالي من خلال المراقبة الفعالة لتحديد مصادر المواد البلاستيكية وكمياتها ومصيرها."
    			},
    			{
    				illo: "small-illos-07",
    				p: "تحسين وتقوية الحوكمة على جميع المستويات."
    			},
    			{
    				illo: "small-illos-08",
    				p: "تعزيز المعرفة ومراقبة الفاعلية باستخدام العلوم السليمة."
    			},
    			{
    				illo: "small-illos-09",
    				p: "تحسين التمويل من خلال المساعدة الفنية وبناء القدرات."
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "تُوفِّر عدّة اتفاقيات ومعاهدات دولية قائمة بالفعل الدعم للحد من التلوث البحري، ومكافحة تغيُّر المناخ (الهدف 13 من أهداف التنمية المستدامة)، والاستخدام المستدام للمحيطات (الهدف 14 من أهداف التنمية المستدامة). وترتبط الشراكة العالمية لمعالجة مشكلة النفايات البحرية، واتفاقية الأمم المتحدة لقانون البحار، واتفاقية التنوع الأحيائي ارتباطاً مباشراً بصحة المحيطات ونظمها الإيكولوجية والحياة البحرية فيها. أما اتفاقيات بازل واستكهولم وروتردام فتتعلق بنقل  النفايات الخطرة والمواد الكيميائية والتخلص منها. وهناك أيضاً زخم متزايد يدفع نحو اتفاقٍ عالمي محتمل بشأن النفايات البحرية والتلوث البلاستيكي من أجل التصدي لهذه الآفة."
    			},
    			{
    				p: "لا مجال لحلٍ منفرد. فكما هي الحال مع كثيرٍ من التعدّيات على البيئة عبر الأجيال، يتطلب هذا الأمر تفكيراً وابتكاراً وتحوُّلاً جذرياً. ومع ذلك، فالهدف واحد: الحد من استخدام المواد البلاستيكية غير الضرورية التي يمكن تجنبها والتي تسبب مشاكل ووقف تدفقها إلى بحيراتنا وأنهارنا وأراضينا الرطبة وسواحلنا وبحارنا. كلنا في المركب نفسها، ويمكننا من خلال العمل معاً، بل يجب علينا، إيجاد حلّ لمشكلة النفايات البحرية والتلوث بالمواد البلاستيكية."
    			}
    		]
    	},
    	{
    		type: "download",
    		head: "تنزيل تقرير برنامج الأمم المتحدة للبيئة: من التلوث إلى الحلّ: تقييم عالمي للقمامة البحرية والتلوث البلاستيكي",
    		cover: "cover",
    		other: "موارد أخرى (معلومات بيانية)",
    		downloadlink: "https://wedocs.unep.org/xmlui/bitstream/handle/20.500.11822/36963/POLSOL.pdf",
    		furtherlink: "https://www.unep.org/resources/pollution-solution-global-assessment-marine-litter-and-plastic-pollution",
    		further: "موارد أخرى"
    	},
    	{
    		type: "footer",
    		head: "انضموا إلى برنامج الأمم المتحدة للبيئة وبادروا باتخاذ إجراءات فورية!",
    		text: [
    			{
    				p: "إنّ <a href=\"https://www.unep.org/environmentassembly/about-united-nations-environment-assembly\">جمعية الأمم المتحدة للبيئة</a> هي أعلى هيئة في العالم معنية باتخاذ القرارات المتعلقة بالبيئة، ويبلغ عدد أعضائها 193 عضواً. وتضع الجمعية أولويات السياسات البيئية على الصعيد العالمي، وتصوغ القانون البيئي الدولي، وتوفر القيادة، وتُحفِّز العمل الحكومي الدولي المتعلق بالبيئة، وتساهم في تنفيذ <a href=\"https://sustainabledevelopment.un.org/\">خطة التنمية المستدامة لعام 2030</a>. إنّ هذا التقييم التاريخي من شأنه أن يحثّ الحكومات في مؤتمر جمعية الأمم المتحدة للبيئة (الدورة 5، الجلسة 2) المقبل المقرر عقده في شباط/فبراير 2022، على اتخاذ إجراءات عالمية حاسمة للتصدي لأزمة القمامة البلاستيكية. وسيُمكِّنكم الحصول على اعتماد برنامج الأمم المتحدة للبيئة من المشاركة. وتُشجَّع المنظمات على إرسال طلبات الاعتماد قريباً حتى يمكن معالجتها في الأوان المطلوب. تفضّلوا باكتشاف مزيدٍِ من المعلومات <a href=\"https://www.unep.org/civil-society-engagement/accreditation\">من هنا</a>."
    			},
    			{
    				p: "انطلاقاً من العمل الطويل الأمد الذي يضطلع به برنامج الأمم المتحدة للبيئة و<a href=\"https://unep-marine-litter.vercel.app/\">الشراكة العالمية لمعالجة مشكلة القمامة البحرية)</a>، تسعى <a href=\"https://www.cleanseas.org/\">حملة «بحار نظيفة»</a> إلى ربط وحشد الأفراد ومجموعات المجتمع المدني والصناعة والحكومات لتحفيز التغيير وإحداث تغيير جذري في الأعراف والممارسات والمعايير والسياسات في جميع أنحاء العالم للحد بشكلٍ كبيرٍ من القمامة البحرية والآثار السلبية الناجمة عنها. وحتى الآن، انضم 63 بلداً، وشارك أكثر من مائة ألف فرد في الحملة من خلال التعهدات بالعمل والالتزامات والتفاعلات عبر وسائل التواصل الاجتماعي. تعرّفوا على كيفية الانضمام والمشاركة في تعهد #CleanSeas (#بحار_نظيفة) <a href=\"https://www.cleanseas.org/make-pledge\"هنا</a>."
    			},
    			{
    				p: "}تجمَع <a href=\"https://www.gpmarinelitter.org/\">الشراكة العالمية لمعالجة مشكلة القمامة البحرية</a> معاً جميع الجهات الفاعلة التي تسعى إلى القضاء على القمامة البحرية والتلوث البلاستيكي والحد منهما. وتُوجَّه الدعوة إلى جميع الكيانات التي تعمل على التصدي لهذه المشكلة العالمية الملحة للانضمام إلى الشراكة العالمية لمعالجة مشكلة القمامة البحرية <a href=\"https://www.gpmarinelitter.org/who-we-are/members/sign-up\">هنا</a>. المنصة الرقمية للشراكة العالمية لمعالجة مشكلة القمامة البحرية هي منصة مفتوحة المصدر ومتعددة أصحاب المصلحة تجمع موارد مختلفة وتربط أصحاب المصلحة وتدمج البيانات اللازمة لتوجيه العمل، بهدف تعزيز الوصول العادل إلى البيانات والمعلومات والتكنولوجيا والابتكار. اكتشفوا معلومات أكثر وانضمّوا إلينا <a href=\"https://digital.gpmarinelitter.org/\">من هنا</a>!"
    			},
    			{
    				p: "تمثل <a href=\"https://www.oneplanetnetwork.org/sustainable-tourism/global-tourism-plastics-initiative\">مبادرة السياحة العالمية للحد من البلاستيك</a> واجهة الالتزام العالمي مع قطاع السياحة. فهناك أكثر من 600 منظمة بما في ذلك 20 حكومة من جميع أنحاء العالم وأكثر من 350 شركة تمثل أكثر من 20 في المائة من شركات حلول التغليف البلاستيكي المستخدمة على الصعيد العالمي هي أطراف موقّعة للالتزام العالمي ومبادرة السياحة العالمية للحد من البلاستيك."
    			}
    		]
    	}
    ];
    var menu$5 = [
    	{
    		item: "تحميل التقرير",
    		short: "تحميل",
    		link: ""
    	}
    ];
    var meta$5 = {
    	title: "من التلوث إلى الحل",
    	url: "unep.org/interactive/pollution-to-solution",
    	description: "تقييم صارم لمختلف التهديدات الصحية والاقتصادية والتهديدات التي تواجه النُّظم الإيكولوجية والحياة البرية والتهديدات المناخية والحلول المرتبطة بالقمامة البحرية والتلوث البلاستيكي.",
    	keywords: "البلاستيك على الشواطئ، بحارٌ نظيفة، تلوث المحيطات، التلوث البلاستيكي، القمامة في المحيط، النفايات البلاستيكية، مصادر تلوث المياه"
    };
    var storyAR = {
    	article: article$4,
    	menu: menu$5,
    	meta: meta$5
    };

    var article$3 = [
    	{
    		type: "intro",
    		head: "От загрязнения<br/> <b>к решению</b>",
    		video: "intro",
    		text: [
    			{
    				p: "Что общего между самой глубокой точкой на дне океана, <b>Марианской впадиной, </b> и самой высокой горной вершиной, <b> Эверестом</b>?"
    			},
    			{
    				p: "Несмотря на то, что оба эти места расположены в самых удаленных и труднодоступных уголках планеты, <b>и там, и там можно найти крошечные кусочки пластика, результат деятельности человека</b>, преодолевшие расстояние во много миль."
    			},
    			{
    				p: "<b>Пластмасса</b> представляет собой самую большую, наиболее опасную и стойкую часть морского мусора, на долю которой приходится по меньшей мере <b>85 процентов от общего объема морских отходов</b>."
    			},
    			{
    				p: "Морской мусор, объемы которого <b>постоянно увеличиваются</b>, можно обнаружить вдоль береговых линий и в устьях рек, в масштабных водоворотах океанских течений, на удаленных островах, в морских льдах..."
    			},
    			{
    				p: "... на морском дне — от полярного круга до глубоких и темных впадин, <b>и повсюду он наносит ущерб морской флоре и фауне</b> и разрушает места обитания на своем пути."
    			}
    		]
    	},
    	{
    		type: "series",
    		tag: "Эта история является частью серии, подготовленной ЮНЕП в целях демонстрации того, как человечество может жить в большей гармонии с природой на свободной от загрязнения и устойчивой к изменениям климата планете.",
    		kicker: "Больше историй из серии",
    		stories: [
    			{
    				item: "Подводная жизнь",
    				link: "https://www.unep.org/interactive/status-world-coral-reefs/"
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "За последние 70 лет пластик, невероятно податливый, универсальный и прочный материал, завоевал рынок и проник, казалось бы, в каждый уголок и щель на Земле. Без пластика не обходятся многие важные блага человечества, от медицинских приборов, спасающих жизни, до безопасных и надежных приспособлений для хранения продуктов питания. Однако ненужные товары из пластмассы, без использования которых можно прожить, такие, как одноразовая упаковка или предметы одноразового использования, загрязняют планету с угрожающей скоростью. Десятилетия экономического роста и растущая зависимость от одноразовых пластиковых изделий стали причиной неуправляемого потока отходов, попадающих в озера, реки, прибрежную среду и, в итоге, в море, и вызывающих множество проблем."
    			},
    			{
    				p: "<strong><a href=\"\">От загрязнения к решению: глобальная оценка загрязнения морским мусором и пластиком</a></strong> показывает, что угроза, с которой сталкиваются все экосистемы, от источника до моря, только возрастает. Также есть доказательства того, что даже при наличии ноу-хау нам необходима политическая воля и срочные действия правительств для преодоления нарастающего кризиса. В докладе будут изложены приоритетные действия на Ассамблее ООН по окружающей среде (UNEA 5.2) в 2022 году, где представители государств соберутся вместе, чтобы определить пути дальнейшего глобального сотрудничества. Новая оценка ООН предупреждает, что, если мы не решим проблему с загрязнением пластиком:"
    			}
    		]
    	},
    	{
    		type: "scrolly-video",
    		video: "litter",
    		text: [
    			{
    				p: "Без срочных мер, по оценкам, количество метрических тонн пластика, которое в настоящее время ежегодно попадают в океан и равно 11 миллионам, утроится в течение следующих двадцати лет."
    			},
    			{
    				p: "Это означает, что к 2040 году в океан ежегодно будет поступать от 23 до 37 миллионов метрических тонн пластика."
    			},
    			{
    				p: "Это эквивалентно 50 килограммам пластика на метр береговой линии во всем мире…"
    			},
    			{
    				p: "... или массе целых 178 «Симфоний морей», самого большого круизного лайнера в мире."
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Проблема переросла в глобальный кризис, требующий неотложных и постоянных внимания и действий. Эта оценка является последним призывом обратить внимание на повсеместное распространение морского мусора и неблагоприятные последствия загрязнения пластиком, от деградации окружающей среды до экономических потерь для сообществ и отраслей промышленности, рисков для здоровья человека, и указывает, как мы можем изменить ситуацию. Пришло время объединить усилия, чтобы в корне изменить ситуацию с морским мусором и загрязнением пластиком, внедряя множество уже имеющихся масштабных и специализированных решений с учетом срочности, инноваций, приверженности и подотчетности."
    			}
    		]
    	},
    	{
    		type: "pill",
    		short: "Насколько малы частицы микропластика и нанопластика?",
    		long: "Микропластик и нанопластик — это пластмассовые изделия длиной от 5 миллиметров до менее чем нескольких нанометров."
    	},
    	{
    		type: "text",
    		head: "Ущерб, наносимый морской флоре и фауне",
    		text: [
    			{
    				p: "Морской мусор и загрязнение пластиком являются критическими проблемами по многим причинам. Пластмассы не разлагаются под воздействием микроорганизмов (естественным путем, не нанося вреда окружающей среде). Вместо этого они со временем распадаются на все более мелкие кусочки, известные как микропластик и нанопластик, которые могут стать причиной значительных неблагоприятных воздействий."
    			},
    			{
    				p: "Воздействие на морскую флору и фауну варьируется от физического или химического вреда отдельным животным до более широкого воздействия на биоразнообразие и функционирование экосистем. Кусочки пластика были обнаружены в пищеварительной системе многих водных организмов, в том числе у всех видов морских черепах и почти у половины всех обследованных видов морских птиц и морских млекопитающих."
    			}
    		]
    	},
    	{
    		type: "scrolly-video",
    		video: "harm_to_animals",
    		text: [
    			{
    				p: "Морские черепахи ошибочно принимают плавающие пластиковые пакеты за медуз и медленно умирают от голода по мере того, как их желудки заполняются неперевариваемым мусором."
    			},
    			{
    				p: "Морские птицы клюют пластик, потому что <a href=\"https://www.nature.com/articles/376680a0.epdf?sharing_token=XzA3pMyq1-90bp8IHPsDiNRgN0jAjWel9jnR3ZoTv0NjqwHPzT2EZOmoupSkNogAcZGDea6VHenadcy2ZVTQLAQygdRw7H4UC7py46oKWTeTp_jR-LXk4EUiQD6fCfvgRxa9FeT2BsqDP4gNHAHc1UOJNEfRsAF6L4Fzte3kHmnRcOOaeLbB7-DtdeGWOnUkVs0C8l8RNzNyQal8GyWw8jg93siTVTmEMCZPcazH8Z6Ugd6g-RzwR2_TN5PgL8qQP1k1RCdu4pqP8R7_z_ucaoN-S1AoVv52tqlLZZR6c5k%3D&amp;tracking_referrer=www.scientificamerican.com\">его запах и внешний вид напоминает им пищу</a>."
    			},
    			{
    				p: "Морские млекопитающие, морские черепахи и другие животные часто тонут, попав в ловушку <a href=\"https://www.fisheries.noaa.gov/alaska/marine-life-distress/pinniped-entanglement-marine-debris\">потерянного или выброшенного пластика</a>, в том числе упаковки или рыболовные снасти."
    			},
    			{
    				p: "Основной причиной смерти <a href=\"https://www.fisheries.noaa.gov/species/north-atlantic-right-whale\">гренладских китов</a>, одного из находящихся под угрозой исчезновения видов, становится фантомный промысел."
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Но есть и менее очевидные последствия. Мало того, что токсины, уже обнаруженные в пластмассах, влияют на океанские цепи питания, известно, что кусочки пластика впитывают загрязняющие вещества, которые попадают с суши в море, включая фармацевтические и промышленные отходы. По мере того, как одни морские виды используют в пищу других, токсический эффект передается между звеньями пищевой цепи. Также растет озабоченность по поводу того, что неаборигенные виды, перемещающиеся через весь океан на плавучем мусоре в чужеродные моря и почвы, например водоросли, моллюски и ракушки, способны захватить и уничтожить удаленные водные среды и виды. Усугубляет проблему тот факт, что большая часть пластикового мусора в океане в конечном итоге опускается на морское дно, как затопленная мусорная куча, задушив коралловые рифы и морскую флору и фауну внизу."
    			}
    		]
    	},
    	{
    		type: "illo",
    		illo: "woman"
    	},
    	{
    		type: "text",
    		head: "Ущерб, наносимый человечеству",
    		text: [
    			{
    				p: "Загрязнение морской среды пластиком и морским мусором также ставит под угрозу жизни людей. Здоровье окружающей среды неразрывно связано со здоровьем человека. Повсеместное распространение микропластика по всей планете вызывает серьезные опасения за безопасность людей. <a href=\"https://www.acs.org/content/acs/en/pressroom/newsreleases/2020/august/micro-and-nanoplastics-detectable-in-human-tissues.html\">Согласно новому исследованию,</a> мы вдыхаем микропластик с воздухом, получаем его с водой и пищей и даже впитываем через кожу. Микропластик находили даже в <strong>легких, печени, селезенке и почках человека</strong>, а одно исследование недавно обнаружило микропластик в <strong>плаценте</strong> новорожденных."
    			},
    			{
    				p: "До сих пор точно не известно, насколько велико влияние микропластика на здоровье человека, поскольку эта отрасль науки только зарождается. Однако уже имеются существенные доказательства того, что химические вещества, связанные с пластмассами, такие как метилртуть, пластификаторы и антипирены, могут попадать в организм и вызывать проблемы со здоровьем, особенно у женщин. Ученые полагают, что некоторые из распространенных химических веществ, содержащихся в пластмассах, такие как бисфенол А, фталаты и полихлорированные дифенилы (ПХД), также способны проникать в организм. Эти химические вещества становятся причиной нарушений эндокринной системы, нарушений развития и репродуктивной функции, а также вызывают рак. Это достаточная причина для применения принципа принятия мер предосторожности."
    			}
    		]
    	},
    	{
    		type: "pill",
    		short: "Китай запретил ввоз большинства пластиковых отходов",
    		long: "В 2018 году Китай запретил импорт большинства пластиковых отходов в целях улучшения состояния окружающей среды, качества воздуха и экономики в пределах своих границ, поскольку большая часть мусора оказывалась на свалках или попадала в воду и почву."
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Последствия загрязнения пластиком не одинаковы в разных частях планеты. Более богатые страны производят больше пластиковых отходов, которые слишком часто поступают в менее развитые страны, где управление отходами не налажено на должном уровне. Переработка может помочь сократить производство пластика и количество пластиковых отходов; однако серьезной проблемой является низкий уровень переработки пластмассы во всем мире, в настоящее время составляющий менее 10 процентов."
    			},
    			{
    				p: "Сообщества развивающихся стран хуже других способны справиться с экологическим, медицинским, социальным и культурным бременем загрязнения пластиком из-за отсутствия государственной поддержки или финансирования. Это означает, что женщины, дети, уборщики мусора, прибрежные сообщества, коренные народы и люди, зависящие от океана,<a href=\"https://www.unescap.org/sites/default/files/publications/CS76%20Theme%20Study.pdf\"> подвергаются куда более интенсивному влиянию</a>, особенно при перемещении или сжигании неправильно обработанных отходов. Это также означает экономические проблемы из-за обилия пластмасс."
    			},
    			{
    				p: "Пластик, попадая в море, негативно влияет на способность множества экосистем обеспечивать основные блага, которыми люди пользуются и которые воспринимают как должное, от чистой воды до продуктивной аквакультуры и рыболовства, борьбы с вредителями и болезнями, управления климатом, а также наследия и отдыха. Согласно оценке «От загрязнения к решению», загрязнение морей пластиком каждый год снижает ценность услуг морской экосистемы по меньшей мере на 500-2500 миллиардов долларов США, при этом в сумму не включены другие социальные и экономические потери, связанные, например, с туризмом и судоходством."
    			},
    			{
    				p: "Оценка подчеркивает, что прямые экономические потери прибрежных и морских отраслей промышленности, таких как рыболовство и судоходство, существенны. В Средиземноморском регионе эти потери оцениваются почти в 138 миллионов долларов США в год. В регионе Азиатско-Тихоокеанского экономического сотрудничества убытки составили 10,8 миллиарда долларов США, что почти в десять раз больше по сравнению с 2009 годом. Однако информация о таких потерях не представлена должным образом, поэтому истинные масштабы влияния морского мусора и загрязнения пластиком на здоровье людей, окружающей среды и общества остаются неизвестны."
    			}
    		]
    	},
    	{
    		type: "header",
    		head: "Пластик и изменение климата",
    		video: "coral-polluted"
    	},
    	{
    		type: "pill",
    		short: "Количественное соотношение самцов и самок водоплавающих черепах?",
    		long: "Микропластик способен повышать температуру на пляжах, где гнездятся морские черепахи. Поскольку температура песка определяет пол черепах, более теплые места гнездования могут изменить соотношение самцов и самок, вылупляющихся на таких пляжах."
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Пластмассы также оказывают влияние на изменение климата. Не все знают, что основным сырьем для производства пластика является нефть, ископаемое топливо. Чем больше пластика мы производим, тем больше требуется ископаемого топлива и тем больше мы усиливаем климатический кризис в непрерывном цикле отрицательной обратной связи. Кроме того, изделия из пластика производят выбросы парниковых газов на протяжении всего цикла существования. Если не будет предпринято никаких действий, выбросы парниковых газов в результате производства, переработки и сжигания пластмасс <a href=\"https://www.pewtrusts.org/-/media/assets/2020/07/breakingtheplasticwave_report.pdf\">к 2040 году достигнут 19% от общих допустимых выбросов, указанных в Парижском соглашении</a>, чтобы по-прежнему успешно сдерживать скорость изменения климата в границах 1,5 градусов Цельсия."
    			},
    			{
    				p: "В последние годы возросла необходимость защиты океана и морей для решения проблемы изменения климата. Океан является крупнейшим поглотителем углерода на планете: в нем хранится <a href=\"https://www.climate.gov/news-features/understanding-climate/climate-change-ocean-heat-content\">до 90 процентов дополнительного тепла, которое выбросы углерода удерживают в нашей атмосфере</a>, и треть дополнительного количества углекислого газа, образовавшегося за период после промышленной революции. Поглощение большого количества углерода замедлило видимые последствия потепления планеты, но также ускорило катастрофические последствия ниже поверхности воды, а именно повышение температуры, подкисление и химический дисбаланс океана."
    			},
    			{
    				p: "Углерод содержится в каждом компоненте океана, особенно в мангровых зарослях, морских водорослях, кораллах и солончаках. Чем больше ущерб, который мы наносим нашим океанским и прибрежным районам, тем труднее этим экосистемам как компенсировать его, так и оставаться устойчивыми к изменению климата."
    			},
    			{
    				p: "Еще более тревожен тот факт, <a href=\"https://www.sciencedirect.com/science/article/abs/pii/S0048969721002886\">что недавнее исследование</a> загрязнения морской среды пластиком, проведенное GRID-Arendal, партнером ЮНЕП, показало, что четыре прибрежные экосистемы, которые накапливают больше всего углерода и служат естественными барьерами от повышения уровня моря и штормов, а именно мангровые заросли, морские травы, солончаки и коралловые рифы, подвержены влиянию загрязнения пластиком на суше из-за их близости к рекам. Изучение и исследования морского мусора как никогда ранее имеют важное значение для прогнозирования последствий воздействия, разработки подходов к смягчению последствий и руководства адаптацией."
    			}
    		]
    	},
    	{
    		type: "pill",
    		short: "Здоровые мангровые леса",
    		long: "<a href=\"https://www.sciencedaily.com/releases/2011/04/110404173247.htm\">Здоровые прибрежные мангровые леса хранят больше углерода на единицу площади, чем почти любой другой лес на Земле</a>."
    	},
    	{
    		type: "header",
    		head: "От загрязнения пластиком к решению проблемы",
    		video: "waste"
    	},
    	{
    		type: "текст",
    		text: [
    			{
    				p: "Лавинообразное загрязнение, разрушение биоразнообразия и нестабильность климата являются наиболее острыми планетарными кризисами нашего времени. Быстрый рост производства пластика уже угрожает природным системам Земли, от которых зависит жизнь, и, по прогнозам, ситуация усугубится. Ожидается, что к 2040 году пластиковые отходы будут представлять ежегодный финансовый риск в размере 100 миллиардов долларов США для предприятий, которым придется нести расходы по управлению такими ожидаемыми объемами отходов. Согласно предположениям, <a href=\"https://www.eionet.europa.eu/etcs/etc-wmge/products/impact-of-covid-19-on-single-use-plastics-and-the-environment-in-europe\" target=\"_blank\">только в Италии в 2020 году было произведено от 160 000 до 440 000 метрических тонн дополнительных отходов</a> из-за увеличившегося спроса на медицинские<strong> средства защиты во время пандемии Covid-19</strong>. Если хотя бы один процент от этого количества масок был утилизирован с несоблюдением правил, это означало бы, что в океан ежемесячно попадает, загрязняя его, до 10 миллионов масок."
    			},
    			{
    				p: "Хотя количество морского пластика, с которым необходимо бороться, настолько велико, что его трудно оценить, наука доказывает, что большинство необходимых решений уже найдено. Множество мероприятий на региональном, национальном и местном уровнях помогают уменьшить поток пластика в океан, например, конвенции по региональным морям, национальные запреты на одноразовые пластиковые изделия, обязательства <a href=\"https://ellenmacarthurfoundation.org/topics/the-global-commitment/overview\">бизнеса и правительства</a> по сокращению, модернизации и повторного использования пластмассовых изделий, увеличению содержания переработанного пластика в новых продуктах, уборке обочин, а также муниципальные запреты на использование пакетов."
    			},
    			{
    				p: "\"<a href=\"https://www.pewtrusts.org/en/research-and-analysis/articles/2020/07/23/breaking-the-plastic-wave-top-findings\" target=\"_blank\">Breaking the Plastic Wave</a>\", глобальный анализ способов изменения траектории движения пластиковых отходов, показывает, что мы можем сократить количество пластика, попадающего в океан, примерно на 80 процентов в следующие два десятилетия при условии использования существующих технологий и решений."
    			},
    			{
    				p: "Сохранить привычный порядок вещей уже не является приемлемым вариантом. Согласно оценке «От загрязнения к решению», масштабы проблемы требуют срочных обязательств и действий на глобальном уровне на протяжении всего жизненного цикла пластмассы и от источника загрязнения до моря для достижения необходимого долгосрочного сокращения отходов, производимых на суше."
    			}
    		]
    	},
    	{
    		type: "big-text",
    		text: [
    			{
    				illo: "small-illos-02",
    				p: "Усовершенствовать системы управления отходами с целью создания надлежащей инфраструктуры для сбора пластиковых отходов и обеспечения повторного использования и переработки большинства из них."
    			},
    			{
    				illo: "small-illos-03",
    				p: "Повысить цикличность за счет поощрения более устойчивых методов потребления и производства во всей цепочке создания стоимости, связанной с производством пластика."
    			},
    			{
    				illo: "small-illos-04",
    				p: "Вовлечь потребителей в борьбу с загрязнением пластиком, чтобы повлиять на рынок и вдохновить на изменение поведения."
    			},
    			{
    				illo: "small-illos-05",
    				p: "Остановить производство, отказавшись от ненужных, предотвратимых и наиболее проблемных пластиковых изделий и заменив их альтернативными материалами, продуктами и услугами."
    			},
    			{
    				illo: "small-illos-06",
    				p: "С помощью эффективного мониторинга определить источники загрязнения, количество и дальнейшую судьбу пластика."
    			},
    			{
    				illo: "small-illos-07",
    				p: "Усовершенствовать и укрепить управление на всех уровнях."
    			},
    			{
    				illo: "small-illos-08",
    				p: "Расширить знания и улучшить контроль эффективности с опорой на достоверные научные данные."
    			},
    			{
    				illo: "small-illos-09",
    				p: "Улучшить финансирование благодаря технической помощи и наращиванию потенциала."
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Несколько существующих международных соглашений и конвенций уже оказывают поддержку в сокращении загрязнения морской среды, борьбе с изменением климата (ЦУР 13) и устойчивом потреблении ресурсов Мирового океана (ЦУР 14). Глобальное партнерство по морскому мусору, Конвенция Организации Объединенных Наций по морскому праву и Конвенция о биологическом разнообразии напрямую связаны со здоровьем океана, его экосистем, а также морской флоры и фауны. Базельская, Стокгольмская и Роттердамская конвенции касаются перевозки и захоронения опасных отходов и химических веществ. Также набирает обороты потенциальное глобальное соглашение по морскому мусору и загрязнению пластиком в целях борьбы с этим бедствием."
    			},
    			{
    				p: "Единого решения не существует. Как и в случае многих других экологических проблем, существующих на протяжении поколений, здесь требуются системное мышление, инновации и преобразования. Однако цель одна: сократить использование ненужных, неважных и проблемных пластмасс и остановить их попадание в наши озера, реки, водно-болотные угодья, моря и на побережья. Это общая проблема, и вместе мы можем, должны решить проблему морского мусора и загрязнения пластиком."
    			}
    		]
    	},
    	{
    		type: "download",
    		downloadlink: "https://wedocs.unep.org/xmlui/bitstream/handle/20.500.11822/36963/POLSOL.pdf",
    		furtherlink: "https://www.unep.org/resources/pollution-solution-global-assessment-marine-litter-and-plastic-pollution",
    		head: "Скачайте доклад ЮНЕП: От загрязнения к решению: глобальная оценка загрязнения морским мусором и пластиком",
    		cover: "cover",
    		other: "Другие ресурсы (инфографика)",
    		further: "Дополнительные ресурсы"
    	},
    	{
    		type: "footer",
    		head: "Присоединяйтесь к действиям ЮНЕП прямо сейчас!",
    		text: [
    			{
    				p: "<a href=\"https://www.unep.org/environmentassembly/about-united-nations-environment-assembly\">Ассамблея Организации Объединенных Наций по окружающей среде</a> (ЮНЕА) — это всемирный директивный орган, занимающийся вопросами окружающей среды на высшем уровне, в который входят все 193 государства-члена. Ассамблея устанавливает приоритеты глобальной экологической политики, развивает международное экологическое право, обеспечивает руководство, стимулирует межправительственные действия в области окружающей среды и способствует осуществлению <a href=\"https://sustainabledevelopment.un.org/\">Повестки дня ООН в области устойчивого развития на период до 2030 года</a>. Эта эпохальная оценка на следующей сессии UNEA-5.2 в феврале 2022 года призовет правительства предпринять решительные глобальные действия для решения кризиса, связанного с загрязнением пластиком. Вы можете принять участие в мероприятии при наличии аккредитации Программы ООН по окружающей среде. Организациям рекомендуется направить запрос на получение аккредитации как можно раньше, чтобы решение было принято вовремя. Узнайте больше <a href=\"https://www.unep.org/civil-society-engagement/accreditation\">здесь</a>."
    			},
    			{
    				p: "Основанная на многолетней работе ЮНЕП и <a href=\"https://unep-marine-litter.vercel.app/\">Глобального партнерства по морскому мусору (GPML)</a>, the <a href=\"https://www.cleanseas.org/\">кампания Clean Seas Campaign</a> объединяет и сплачивает отдельных людей, группы гражданского общества, промышленность и правительства, чтобы стимулировать изменения и трансформировать привычки, методы, стандарты и политику по всему миру в целях значительного сокращения количества морского мусора и решения негативных последствий загрязнения. На сегодняшний день к кампании присоединились 63 страны, и более ста тысяч человек приняли участие в ней, активно действуя, принимая на себя обязательств и распространяя информацию в социальных сетях. Узнайте, как присоединиться к кампании и взять на себя обязательства в рамках #CleanSeas pledge, <a href=\"https://www.cleanseas.org/make-pledge\">здесь</a>."
    			},
    			{
    				p: "<ahref=\"https://www.gpmarinelitter.org/\">Глобальное партнерство по морскому мусору</a> (GPML) объединяет всех участников, работающих над предотвращением и сокращением загрязнения морским мусором и пластиком. Мы приглашаем все организации, работающие над решением этой неотложной глобальной проблемы, присоединиться к GPML<ahref=\"https://www.gpmarinelitter.org/who-we-are/members/sign-up\"> здесь</a>. Цифровая платформа GPML — это платформа с открытым исходным кодом для многих заинтересованных сторон, которая объединяет различные ресурсы, заинтересованные стороны и данные для руководства действиями с целью содействия справедливому доступу к данным, информации, технологиям и инновациям. Узнавайте больше и присоединяйтесь <a href=\"https://digital.gpmarinelitter.org/\">здесь</a>!"
    			},
    			{
    				p: "<a href=\"https://ellenmacarthurfoundation.org/topics/the-global-commitment/overview\">Глобальное обязательство инициативы New Plastics Economy</a> объединяет предприятия, правительства и другие организации в цепочке создания стоимости пластмасс, формируя <a href=\"https://emf.thirdlight.com/link/86tanzqdbppx-8rdpns/@/preview/1?o\">общее видение</a>  и цели по устранению пластиковых отходов и загрязнения на самых ранних этапах. Его возглавляет <a href=\"https://ellenmacarthurfoundation.org/\">Фонд Эллен Макартур</a> в сотрудничестве с <a href=\"https://www.unep.org/\">ЮНЕП</a>. Стороны, подписавшие соглашение, обязуются предпринять конкретные действия по УСТРАНЕНИЮ ненужного нам пластика; ВНЕДРЕНИЮ ИННОВАЦИЙ для обеспечения того, чтобы необходимые нам пластиковые изделия были многоразовыми, пригодными для вторичной переработки или компостирования; и ЦИКЛИЧНОМУ ИСПОЛЬЗОВАНИЮ всех пластиковых изделий, чтобы сохранить их в экономике и не дать попасть в окружающую среду."
    			},
    			{
    				p: "The <a href=\"https://www.oneplanetnetwork.org/sustainable-tourism/global-tourism-plastics-initiative\">Глобальная туристическая инициатива по пластмассам</a> (GTPI) — это «лицо» Глобального обязательства в сфере туризма. Более 600 организаций, в том числе 20 правительств со всего мира, и более 350 предприятий, на долю которых приходится более 20 процентов пластиковой упаковки, используемой во всем мире, подписали Глобальное обязательство и GTPI."
    			},
    			{
    				p: "<a href=\"https://www.oneplanetnetwork.org/one-planet-network-wide-plastics-initiative\">Инициатива One Planet Network-Wide Plastics Initiative</a> призывает к действиям в рамках общей концепции, основанной на фактических данных и знаниях, полученных ЮНЕП, при одновременном использовании различного опыта и партнерских отношений в рамках программ сети One Planet. Пластиковая упаковка на этапе использования цепочки создания стоимости пластмасс является ключевой отправной точкой для принятия коллективных ответных мер."
    			}
    		]
    	}
    ];
    var resources$3 = [
    ];
    var menu$4 = [
    	{
    		item: "Скачать доклад",
    		short: "Скачать",
    		link: "https://wedocs.unep.org/xmlui/bitstream/handle/20.500.11822/36963/POLSOL.pdf"
    	}
    ];
    var meta$4 = {
    	title: "От загрязнения к решению проблемы",
    	url: "unep.org/interactive/pollution-to-solution",
    	description: "Тщательная оценка различных угроз для здоровья, экономики, экосистем, дикой природы и климата, а также решений, связанных с морским мусором и загрязнением пластиком.",
    	keywords: "Пластик на пляжах, Чистые моря, Загрязнение океана, Загрязнение пластиком, Мусор в океане, Пластиковые отходы, Источники загрязнения воды"
    };
    var storyRU = {
    	article: article$3,
    	resources: resources$3,
    	menu: menu$4,
    	meta: meta$4
    };

    var article$2 = [
    	{
    		type: "intro",
    		head: "从污染<br/><b>到解决方案</b>",
    		video: "intro",
    		text: [
    			{
    				p: "海洋中最深的地方——<b>马里亚纳海沟</b>和世界上最高的山峰——<b>珠穆朗玛峰，它们有什么共同之处</b>？"
    			},
    			{
    				p: "它们尽管都是地球上最偏远、最难到达的地方，<b>但都散布着很远处人类活动产生的微小塑料碎片</b>。"
    			},
    			{
    				p: "<b>塑料制品</b>是海洋垃圾中最大、最有害和最持久的部分，至少<b>占海洋垃圾总量的85%</b>。"
    			},
    			{
    				p: "海洋垃圾<b>的数量越来越多，遍布我们的海岸线和河口，出现在巨大的海洋漩涡中，现身在遥远的岛屿上，融入海冰中……</b>"
    			},
    			{
    				p: "海洋垃圾沉入海底，从极地到最深最黑的海沟，无处不在，<b>危害着海洋生物，</b>并破坏着它们所到之处的栖息地。"
    			}
    		]
    	},
    	{
    		type: "series",
    		tag: "这个故事是联合国环境规划署系列报道的一部分，展示了人类如何在一个没有污染和气候稳定的星球上与自然更加和谐地相处。",
    		kicker: "该系列的更多报道",
    		stories: [
    			{
    				item: "水下生命",
    				link: "https://www.unep.org/interactive/status-world-coral-reefs/"
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "在过去的70年里，塑料——一种可塑性极强、多用途和经久耐用的材料——渗透到市场，进而渗透到地球上几乎每一个角落。塑料带来了诸多重要的益处，例如，既可以制成拯救生命的医疗设备，也能长时间安全储存食品。然而，不必要和可避免的塑料制品，特别是一次性包装和一次性用品，正在以惊人的速度污染我们的地球。过去几十年，随着经济的增长，人们越来越依赖一次性的塑料制品，大量未经管理的废弃物进入湖泊、河流、沿海环境，并最终流入大海，引发了一连串问题。"
    			},
    			{
    				p: "<strong><a href=\"\">《从污染到解决方案：全球海洋垃圾和塑料污染评估》</a></strong>报告表明，从源头到海洋的所有生态系统都存在着日益严重的威胁。报告还表明，虽然我们拥有专业知识，但我们还需要政府的政治意愿和紧急行动，才能应对日益严重的危机。报告将为2022年联合国环境大会（UNEA 5.2）上的优先行动提供参考，各国将在大会上共同决定全球合作的前进方向。新的联合国评估报告警告说，除非我们能处理好塑料问题："
    			}
    		]
    	},
    	{
    		type: "scrolly-video",
    		video: "litter",
    		text: [
    			{
    				p: "如果不采取紧急行动，估计目前每年进入海洋的1100万公吨的塑料将在未来20年内增加两倍。"
    			},
    			{
    				p: "这意味着到2040年，每年将有2300万至3700万公吨的塑料流进海洋。"
    			},
    			{
    				p: "这相当于全世界每一米海岸线上有50公斤的塑料……"
    			},
    			{
    				p: "或重量相当于178艘世界上最大的游轮 ——“海洋交响乐”号。"
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "这一问题已发展成为一场全球危机，需要立即和持续地予以关注并采取行动。这项评估给我们敲响了振聋发聩的警钟，让我们认识到海洋垃圾的普遍存在和塑料污染造成的不利影响——从环境退化到社区和工业的经济损失，再到人类健康风险——并告诉我们如何才能更好地挽救危局。现在是时候携起手来，增强紧迫感和责任感，通过创新方式全力以赴地实施现有的各种大大小小的解决方案，扭转海洋垃圾和塑料污染的趋势了。"
    			}
    		]
    	},
    	{
    		type: "pill",
    		short: "微塑料和纳米塑料有多小？",
    		long: "微塑料和纳米塑料是指直径从5毫米到不足几纳米的塑料碎片。"
    	},
    	{
    		type: "text",
    		head: "对海洋生物的危害",
    		text: [
    			{
    				p: "海洋垃圾和塑料污染问题重重，原因很多。塑料无法生物降解（以对环境无害的方式自然分解）。相反，它们会随着时间的推移分解成越来越小的碎片，即微塑料和纳米塑料，这可能会产生重大的不利影响。"
    			},
    			{
    				p: "对海洋生物的影响包括对各种动物造成的物理或化学伤害，以及对生物多样性和生态系统功能造成的更广泛影响。在许多水生生物的消化系统中都发现了塑料碎片，包括每一种海龟物种和近一半被调查的海鸟和海洋哺乳动物物种。"
    			}
    		]
    	},
    	{
    		type: "scrolly-video",
    		video: "harm_to_animals",
    		text: [
    			{
    				p: "海龟将漂浮的塑料袋误认为是水母，当它们的胃被难以消化的垃圾填满时，就会慢慢饿死。"
    			},
    			{
    				p: "海鸟啄食塑料，因为<a href=\"https://www.nature.com/articles/376680a0.epdf?sharing_token=XzA3pMyq1-90bp8IHPsDiNRgN0jAjWel9jnR3ZoTv0NjqwHPzT2EZOmoupSkNogAcZGDea6VHenadcy2ZVTQLAQygdRw7H4UC7py46oKWTeTp_jR-LXk4EUiQD6fCfvgRxa9FeT2BsqDP4gNHAHc1UOJNEfRsAF6L4Fzte3kHmnRcOOaeLbB7-DtdeGWOnUkVs0C8l8RNzNyQal8GyWw8jg93siTVTmEMCZPcazH8Z6Ugd6g-RzwR2_TN5PgL8qQP1k1RCdu4pqP8R7_z_ucaoN-S1AoVv52tqlLZZR6c5k%3D&amp;tracking_referrer=www.scientificamerican.com\">塑料的味道和外形跟食物类似</a>。"
    			},
    			{
    				p: "海洋哺乳动物、海龟和其他动物经常在被困在<a href=\"https://www.fisheries.noaa.gov/alaska/marine-life-distress/pinniped-entanglement-marine-debris\">丢失或丢弃的塑料</a>中（包括塑料包装或渔具）后淹死。"
    			},
    			{
    				p: "<a href=\"https://www.fisheries.noaa.gov/species/north-atlantic-right-whale\">北大西洋露脊鲸</a>是世界上最濒危的鲸鱼之一，它的一个主要死因是被幽灵渔具所困。"
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "还有一些不那么明显的影响。塑料中已经发现的毒素不仅会影响海洋食物网，而且众所周知，塑料碎片会吸收从陆地流入海洋的污染物，包括制药废弃物和工业废弃物。随着海洋物种的进食和被进食，毒性可以通过食物链转移。人们也越来越担心非本地物种（如藻类、软体动物和藤壶）搭上漂浮垃圾的顺风车进入外国海域和土壤，它们会入侵遥远的水生环境并使物种退化。使问题更加复杂的是，海洋中的大多数塑料垃圾最终会像水下的垃圾堆一样沉入海底，使下面的珊瑚礁和海底海洋生物窒息而死。"
    			}
    		]
    	},
    	{
    		type: "illo",
    		illo: "woman"
    	},
    	{
    		type: "text",
    		head: "对人类的伤害",
    		text: [
    			{
    				p: "人类也面临着海洋垃圾和塑料污染带来的风险。环境健康与人类健康密不可分。微塑料在我们星球上无处不在，引起了人们对安全的严重关切。 <a href=\"https://www.acs.org/content/acs/en/pressroom/newsreleases/2020/august/micro-and-nanoplastics-detectable-in-human-tissues.html\">新的研究</a>表明，人们正在通过空气吸入微塑料，通过食物和水消耗微塑料，甚至通过皮肤吸收微塑料。甚至在<strong>我们的肺、肝、脾和肾</strong>中也发现了微塑料，而最近一项研究在新生儿的<strong>胎盘</strong>中也发现了微塑料。"
    			},
    			{
    				p: "由于这项研究刚刚起步，微塑料对人类健康的全面影响仍是未知数。然而，有大量证据表明，甲基汞、增塑剂和阻燃剂等与塑料相关的化学物质可以进入人体，并带来健康问题，特别是对妇女而言。科学家们还认为，塑料中的一些常见化学物质，如双酚A、邻苯二甲酸酯和多氯联苯，也可能会渗入人体。这些化学物质与内分泌紊乱、发育障碍、生殖异常和癌症有关。这就有足够的理由来采取预防措施了。"
    			}
    		]
    	},
    	{
    		type: "pill",
    		short: "中国禁止进口大部分塑料垃圾",
    		long: "2018年，中国禁止进口大部分塑料垃圾，以帮助改善其境内的环境、空气质量和经济，因为之前的大部分塑料垃圾都被填埋或进入水道和土壤。"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "世界各地对塑料污染的影响感受不一。较富裕的国家产生更多的塑料垃圾，这些垃圾经常流入废弃物管理最不成熟的欠发达国家。回收有助于减少塑料产量和塑料垃圾；然而，目前的一个主要问题是全球塑料回收率低，还不到10%。"
    			},
    			{
    				p: "由于缺乏政府支持或资金，发展中国家的社区最没有能力管理塑料污染带来的环境、健康、社会和文化负担。这意味着妇女、儿童、废弃物处理工人、沿海社区、土著人民和依赖海洋的人<a href=\"https://www.unescap.org/sites/default/files/publications/CS76%20Theme%20Study.pdf\">更强烈地感受到这种影响</a>，尤其是在转移或焚烧管理不善的废弃物时。这也意味着这些经济体因严重的塑料垃圾问题而深受影响。"
    			},
    			{
    				p: "海洋塑料对无数生态系统提供人类既享受又认为理所当然的基本惠益的能力产生了负面影响，例如，清洁的水，高产的水产养殖和渔业，虫害和疾病控制，气候调节，以及遗产和娱乐休闲。《从污染到解决方案》评估报告称，海洋塑料污染每年至少减少了价值5000至25000亿美元的宝贵海洋生态系统服务，这还不包括其他社会和经济损失，如旅游和航运方面的损失。"
    			},
    			{
    				p: "评估报告强调，渔业和航运业等沿海和海运业蒙受了巨大的直接经济损失。在地中海地区，这些损失估计每年接近1.38亿美元。在亚太经济合作区域，损失总额为108亿美元，与2009年相比增加了近10倍。然而，这些损失并没有得到充分的报道，海洋垃圾和塑料污染让人类、环境、社会健康付出的真正代价仍有待发现。"
    			}
    		]
    	},
    	{
    		type: "header",
    		head: "塑料与气候变化",
    		video: "coral-polluted"
    	},
    	{
    		type: "pill",
    		short: "雌雄海龟的比例失调？",
    		long: "微塑料可以提高海龟筑巢的海滩的沙子温度。由于沙子的温度决定了海龟的性别，这些较温暖的巢穴可能会改变在这些海滩上孵化的雌雄海龟的比例。"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "塑料也是一个气候问题。不是每个人都知道塑料主要是由石油这种化石燃料生产出来的。我们制造的塑料越多，需要的化石燃料就越多，于是在一个持续的负反馈循环中加剧了气候危机。此外，塑料产品在整个生命周期中都会排放温室气体。如果不采取行动，又要将升温限制在1.5摄氏度，那么塑料的生产、回收和焚烧所产生的温室气体排放可能占<a href=\"https://www.pewtrusts.org/-/media/assets/2020/07/breakingtheplasticwave_report.pdf\">《巴黎协定》允许的2040年总排放量的19%</a>。"
    			},
    			{
    				p: "近年来，保护海洋以应对气候变化的紧迫性与日俱增。海洋是地球上最大的碳汇，储存了<a href=\"https://www.climate.gov/news-features/understanding-climate/climate-change-ocean-heat-content\">自工业革命以来碳排放滞留在大气中多达90%的额外热量</a>，以及额外产生的二氧化碳的三分之一。海洋在吸收大量的碳后，减缓了地球变暖的可见影响——但也加速了水面下的灾难性影响——海洋变暖、酸化和化学失衡。"
    			},
    			{
    				p: "碳被封存在海洋的各个部分，特别是红树林、海草、珊瑚和盐沼。我们对海洋和沿海地区造成的损害越大，这些生态系统就越难以抵消气候变化的影响、越难以维持对气候变化的抵御能力。"
    			},
    			{
    				p: "令人震惊的是，联合国环境规划署的合作伙伴——全球资源信息数据库阿伦达尔中心最近对海洋塑料污染进行的<a href=\"https://www.sciencedirect.com/science/article/abs/pii/S0048969721002886\">一项研究</a>表明，储存碳最多并作为抵御海平面上升和风暴的天然屏障的四个沿海生态系统——红树林、海草、盐沼和珊瑚礁——由于靠近河流，正在承受着陆基塑料污染的压力。开展海洋垃圾调查和研究比以往任何时候都更加重要，有助于预测压力的后果、设计缓解方法和指导适应工作。"
    			}
    		]
    	},
    	{
    		type: "pill",
    		short: "健康的红树林",
    		long: "<a href=\"https://www.sciencedaily.com/releases/2011/04/110404173247.htm\">健康的沿海红树林每单位面积储存的碳比地球上几乎任何其他森林都多</a>。"
    	},
    	{
    		type: "header",
    		head: "从塑料污染到解决方案",
    		video: "waste"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "猖獗的污染、生物多样性崩溃和气候不稳定是我们这个时代最紧迫的地球危机。塑料生产的快速增长已经对生命赖以生存的地球自然系统构成了威胁，而且预计情况会越来越糟。到2040年，对于需要按预期数量承担废弃物管理成本的企业，预计塑料垃圾将带来每年1000亿美元的财务风险。据估计，仅在意大利，由于<strong>在2019冠状病毒病疫情期间对医疗保护设备</strong>的依赖加剧，2020年就产生了<a href=\"https://www.eionet.europa.eu/etcs/etc-wmge/products/impact-of-covid-19-on-single-use-plastics-and-the-environment-in-europe\" target=\"_blank\">16万至44万公吨的额外废弃物</a>。如果构成这一数字的一次性口罩中只有1%被不当处理，那么每月可能有多达1000万个口罩进入并污染海洋。"
    			},
    			{
    				p: "虽然我们需要解决的海洋塑料的数量庞大到难以想象的地步，但科学告诉我们，我们所需的大部分解决方案其实已经存在。许多区域、国家和地方正在开展活动，帮助减少流入海洋的塑料，如区域海洋公约、国家对一次性塑料的禁令、 <a href=\"https://ellenmacarthurfoundation.org/topics/the-global-commitment/overview\">企业和政府</a>承诺减少、重新设计和使用塑料产品、增加新产品中的回收塑料含量、路边倡议和城市塑料袋禁令。"
    			},
    			{
    				p: "<a href=\"https://www.pewtrusts.org/en/research-and-analysis/articles/2020/07/23/breaking-the-plastic-wave-top-findings\" target=\"_blank\">《打破塑料浪潮》</a>是一项关于如何改变塑料垃圾轨迹的全球分析，该分析揭示，如果我们充分利用现有的技术和解决方案，就可以在未来20年将进入海洋的塑料数量减少约80%。"
    			},
    			{
    				p: "继续“一切照旧”的做法根本行不通。《从污染到解决方案》评估报告解释说，这一问题涉及的范围很大，需要在全球范围内，在整个塑料生命周期内，从源头到海洋都作出紧急承诺并采取紧急行动，以实现长期减少废弃物的必要目标。"
    			}
    		]
    	},
    	{
    		type: "big-text",
    		text: [
    			{
    				illo: "small-illos-02",
    				p: "改善废弃物管理系统，以便有合适的基础设施来接收塑料垃圾，并确保其中很大一部分可以被重新使用或回收。"
    			},
    			{
    				illo: "small-illos-03",
    				p: "通过在整个塑料价值链中促进更可持续的消费和生产实践，增强循环性。"
    			},
    			{
    				illo: "small-illos-04",
    				p: "让消费者参与解决塑料污染问题，以影响市场并激发行为的改变。"
    			},
    			{
    				illo: "small-illos-05",
    				p: "通过逐步淘汰不必要的、可避免的和最有问题的塑料用品，用替代材料、产品和服务取代这些用品，从而堵住污染源。"
    			},
    			{
    				illo: "small-illos-06",
    				p: "通过有效的监测来确定塑料的来源、数量和归宿，从而处理遗留问题。"
    			},
    			{
    				illo: "small-illos-07",
    				p: "完善和加强各级治理。"
    			},
    			{
    				illo: "small-illos-08",
    				p: "利用健全的科学来增进了解和监测有效性。"
    			},
    			{
    				illo: "small-illos-09",
    				p: "通过技术援助和能力建设改善融资。"
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "现有的若干国际协定和公约已经为减少海洋污染、应对气候变化（可持续发展目标13）和可持续利用海洋（可持续发展目标14）提供了支持。海洋垃圾全球伙伴关系、《联合国海洋法公约》和《生物多样性公约》直接关系到海洋、海洋生态系统和海洋生物的健康。《巴塞尔公约》、《斯德哥尔摩公约》和《鹿特丹公约》均涉及危险废弃物和化学品的转移和处置问题。就海洋垃圾和塑料污染问题达成一项潜在的全球协议来解决这一祸害的呼声也越来越高。"
    			},
    			{
    				p: "单靠一种解决方案行不通。与许多代际环境破坏一样，这需要系统性思维、创新和转型。但目标只有一个：减少不必要的、可避免的和有问题的塑料的使用，并阻止它们流入我们的湖泊、河流、湿地、海岸和海洋。我们患难与共，我们可以也必须齐心协力地解决海洋垃圾和塑料污染问题。"
    			}
    		]
    	},
    	{
    		type: "download",
    		head: "下载联合国环境规划署报告：《从污染到解决方案：全球海洋垃圾和塑料污染评估》",
    		cover: "cover",
    		other: "其他资源（信息图表）",
    		downloadlink: "https://wedocs.unep.org/xmlui/bitstream/handle/20.500.11822/36963/POLSOL.pdf",
    		furtherlink: "https://www.unep.org/resources/pollution-solution-global-assessment-marine-litter-and-plastic-pollution",
    		further: "更多资源"
    	},
    	{
    		type: "footer",
    		head: "立即加入联合国环境规划署，一起采取行动!",
    		text: [
    			{
    				p: "<a href=\"https://www.unep.org/environmentassembly/about-united-nations-environment-assembly\">联合国环境大会</a>（UNEA）是世界上关于环境问题的最高级别决策机构，由所有193个会员国组成，具有普遍性。联合国环境大会负责确定全球环境政策的优先事项，制定国际环境法，发挥领导作用，推动政府间环境行动，并促进实施<a href=\"https://sustainabledevelopment.un.org/\">联合国2030年可持续发展议程</a>。这一具有里程碑意义的评估将敦促各国政府在2022年2月举行的第五届联合国环境大会续会（UNEA-5.2）上，采取果断的全球行动来解决塑料危机。获得联合国环境规划署的认证后方可参与。建议各组织尽快发送认证申请，以便及时处理。<a href=\"https://www.unep.org/civil-society-engagement/accreditation\">在此</a>了解更多信息。"
    			},
    			{
    				p: "<a href=\"https://www.cleanseas.org/\">清洁海洋运动</a>以联合国环境规划署和<a href=\"https://unep-marine-litter.vercel.app/\">\"海洋垃圾全球伙伴关系\"（GPML） </a>的长期工作为根基，正在将个人、民间社会团体、行业和政府团结起来，促进变革并改变全球各地的习惯、做法、标准和政策，以大幅减少海洋垃圾及其负面影响。迄今为止，已有63个国家加入清洁海洋运动，超过十万人通过行动承诺和社交媒体互动参与了该运动。<a href=\"https://www.cleanseas.org/make-pledge\">在这里</a>了解如何加入#清洁海洋#运动并做出承诺。"
    			},
    			{
    				p: "<a href=\"https://www.gpmarinelitter.org/\">海洋垃圾全球伙伴关系</a> （GPML）将所有致力于防止和减少海洋垃圾和塑料污染的行为者聚集在一起。诚邀所有致力于解决这一紧迫的全球问题的实体<a href=\"https://www.gpmarinelitter.org/who-we-are/members/sign-up\">在此</a>加入GPML。GPML数字平台是一个开源的多利益攸关方平台，汇集了不同的资源，联络利益相关者并整合数据以指导行动，其目标是促进公平地获取数据、信息、技术和创新成果。<a href=\"https://digital.gpmarinelitter.org/\">在此</a>详细了解并加入！"
    			},
    			{
    				p: "<a href=\"https://ellenmacarthurfoundation.org/topics/the-global-commitment/overview\">《新塑料经济全球承诺》</a>将企业、政府和塑料价值链上的其他组织联合起来，支持<a href=\"https://emf.thirdlight.com/link/86tanzqdbppx-8rdpns/@/preview/1?o\">共同的愿景</a>和目标，以期从源头上解决塑料垃圾和污染。《新塑料经济全球承诺》由<a href=\"https://ellenmacarthurfoundation.org/\">艾伦·麦克阿瑟基金会</a>与<a href=\"https://www.unep.org/\">联合国环境规划署</a>合作领导。签署方承诺采取具体行动，消除我们不需要的塑料；进行创新，确保我们确实需要的塑料产品可重复使用、可回收或可堆肥；并循环使用我们所用的所有塑料制品，使塑料停留在经济系统内而不进入环境。"
    			},
    			{
    				p: "<a href=\"https://www.oneplanetnetwork.org/sustainable-tourism/global-tourism-plastics-initiative\">全球旅游塑料倡议</a>（GTPI）是这一全球承诺与旅游部门的结合点。包括20个国家政府在内的600多个组织和占全球塑料包装使用量20%以上的350多家企业已经签署了这一全球承诺和GTPI。"
    			},
    			{
    				p: "<a href=\"https://www.oneplanetnetwork.org/one-planet-network-wide-plastics-initiative\">同一星球网络塑料倡议</a>以联合国环境规划署提供的证据和知识为基础，通过共同的叙述促进行动，同时充分利用同一星球网络方案内的各种不同专业知识和伙伴关系。塑料价值链中使用阶段的塑料包装是制定同一星球网络集体对策的关键切入点。"
    			}
    		]
    	}
    ];
    var resources$2 = [
    ];
    var menu$3 = [
    	{
    		item: "下载报告",
    		short: "下载",
    		link: "https://wedocs.unep.org/xmlui/bitstream/handle/20.500.11822/36963/POLSOL.pdf"
    	}
    ];
    var meta$3 = {
    	title: "从污染到解决方案",
    	url: "unep.org/interactive/pollution-to-solution",
    	description: "对与海洋垃圾和塑料污染有关的各种健康、经济、生态系统、野生动物和气候威胁及解决方案的严格评估。",
    	keywords: "海滩上的塑料, 清洁海洋, 海洋污染, 塑料污染, 海洋中的垃圾, 塑料垃圾, 水污染的来源"
    };
    var storyZH = {
    	article: article$2,
    	resources: resources$2,
    	menu: menu$3,
    	meta: meta$3
    };

    var article$1 = [
    	{
    		type: "intro",
    		head: "Kutoka Uchafuzi<br/> <b>hadi Suluhisho</b>",
    		video: "intro",
    		text: [
    			{
    				p: "Ni nini kinafanana kati ya kina kirefu kabisa cha bahari, <b> Mariana trench</b>, na kilele cha juu kabisa cha mlima ulimwenguni, <b> Mlima Everest</b>?"
    			},
    			{
    				p: "Licha ya kuwa mazingira ya mbali zaidi na ambayo hayafikiki duniani, <b> zote mbili zina vipande vidogo vya plastiki kutoka kwa shughuli za binadamu </b> walio mbali sana."
    			},
    			{
    				p: "<b>Plastiki</b> ni sehemu kubwa zaidi, yenye madhara zaidi na inayoendelea ya takataka za baharini, ikichangia angalau <b>asilimia 85 ya taka zote za baharini</b>."
    			},
    			{
    				p: "Uchafu wa baharini hupatikana katika <b> viwango vinavyoongezeka </b> kando ya ukanda wa pwani na viunga vya bahari, katika mikondo mikubwa ya katikati ya bahari, kwenye visiwa vya mbali, kwenye barafu la bahari …"
    			},
    			{
    				p: "… kwenye sakafu ya bahari kutoka ncha ya dunia hadi kwenye mitaro yenye giza kabisa, <b> ikidhuru viumbe vya baharini </b> na kuharibu makazi katika njia yake."
    			}
    		]
    	},
    	{
    		type: "series",
    		tag: "Hadithi hii ni sehemu ya safu kutoka UNEP inayoonyesha jinsi wanadamu wanaweza kuishi kwa amani na mazingira kwenye sayari isiyo na uchafuzi wa mazingira na hali ya hewa thabiti.",
    		kicker: "Hadithi zaidi kutoka kwenye misururu",
    		stories: [
    			{
    				item: "Maisha Ndani ya Maji",
    				link: "https://www.unep.org/interactive/status-world-coral-reefs/"
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Kwa zaidi ya miaka 70 iliyopita, plastiki - kifaa kinachoweza kufukulika, chenye matumizi mbalimbali, na ya kudumu - iliingia sokoni na kuingia ndani kila mahali duniani. Plastiki ina faida muhimu, kutoka kwa vifaa vya matibabu vya kuokoa maisha hadi uhifadhi salama wa chakula kwa muda mrefu. Hata hivyo, bidhaa za plastiki zisizohitajika na zinazoweza kuepukika, haswa vifaa vya upakiaji wa mara moja na vitu vya kutupwa vinapotumika, vinachafua sayari yetu kwa viwango vya kutisha. Miongo kadhaa ya ukuaji wa uchumi na kuongezeka kwa utegemezi wa bidhaa za plastiki za kutupwa zimesababisha mafuriko ya taka isiyodhibitiwa ambayo inamwagika kwenye maziwa, mito, mazingira ya pwani, na mwishowe kwenda baharini, na kusababisha msongamano wa shida."
    			},
    			{
    				p: "<strong><a href=\"\">Kutoka kwa Uchafuzi hadi Suluhisho: tathmini ya ulimwengu ya uchafu wa baharini na uchafuzi wa plastiki</a></strong> unaonyesha kuwa kuna tishio kubwa katika mifumo yote ya ikolojia kutoka kwa chanzo hadi bahari. Pia inaonyesha kwamba wakati tuna ujuzi, tunahitaji usaidizi wa kisiasa na hatua za haraka ya serikali kukabiliana na shida inayoongezeka. Ripoti hiyo itaarifu hatua zitakazopewa kipaumbele katika Bunge la UN la Mazingira (UNEA 5.2) mnamo 2022, ambapo nchi zitakutana pamoja kuamua hatua za kuchukuliwa kwa ushirikiano wa ulimwengu. Tathmini mpya ya UN inaonya kuwa isipokuwa tudhibiti shida yetu ya plastiki:"
    			}
    		]
    	},
    	{
    		type: "scrolly-video",
    		video: "litter",
    		text: [
    			{
    				p: "Bila hatua za dharura, wastani wa tani milioni 11 za plastiki zinazoingia baharini kila mwaka zitakuwa mara tatu katika miaka ishirini ijayo."
    			},
    			{
    				p: "Hii inamaanisha ifikapo mwaka 2040 kati ya tani milioni 23 na 37 za plastiki zitakuwa zinaingia baharini kila mwaka."
    			},
    			{
    				p: "Hiyo ni sawa na kilo 50 za plastiki kwa kila mita ya pwani ulimwenguni…"
    			},
    			{
    				p: "… au uzani wa Symphony of the Seas 178, meli kubwa zaidi ya kusafiri ulimwenguni."
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Shida hiyo imeongezeka kuwa tatizo la ulimwengu linalohitaji umakini na hatua ya haraka na endelevu . Tathmini hii inaonyesha jinsi uchafu wa baharini upo kila mahali na athari mbaya za uchafuzi wa plastiki - kutoka kwa uharibifu wa mazingira hadi hasara ya kiuchumi kwa jamii na viwanda, hadi hatari za kiafya kwa binadamu - na inatuonyesha jinsi tunaweza kubadilika. Ni wakati wa kuungana mikono kugeuza wimbi la uchafu wa baharini na uchafuzi wa plastiki kwa kutekeleza suluhisho nyingi - kubwa na ndogo, kwa uharaka, uvumbuzi, kujitolea na uwajibikaji."
    			}
    		]
    	},
    	{
    		type: "pill",
    		short: "Mikroplastiki na nanoplastiki ni ndogo jinsi gani?",
    		long: "Mikroplastiki na nanoplastiki ni vipande vya plastiki ambavyo vina urefu wa milimita 5 hadi chini ya nanomita chache."
    	},
    	{
    		type: "text",
    		head: "Madhara kwa Viumbe vya Baharini",
    		text: [
    			{
    				p: "Uchafu wa baharini na uchafuzi wa plastiki ni tatizo kwa sababu nyingi. Plastiki haiozi (kuoza asili kwa njia ambayo sio hatari kwa mazingira). Badala yake, huvunjika baada ya muda kuwa vipande vidogo vinavyojulikana kama mikroplastiki na nanoplastiki, ambayo inaweza kusababisha athari kubwa mbaya."
    			},
    			{
    				p: "Athari kwa viumbe vya baharini huanzia uharibifu wa mwili au kemikali kwa mnyama mmoja mmoja, kwa athari pana kwa bayoanuai na utendaji wa mifumo ya ikolojia. Vipande vya plastiki vimepatikana katika mfumo wa mmeng'enyo wa viumbe vingi vya majini, ikijumuisha kila spishi ya kasa wa baharini na karibu nusu ya spishi zote za ndege wa baharini na mamalia."
    			}
    		]
    	},
    	{
    		type: "scrolly-video",
    		video: "harm_to_animals",
    		text: [
    			{
    				p: "Kasa wa baharini hudhania mifuko ya plastiki ni kiwavi, wanakufa kwa njaa huku tumbo zao zikiwa zimejaa uchafu usioweza kumeng’enywa."
    			},
    			{
    				p: "Ndege wa baharini hudonoa plastiki kwa sababu <a href=\"https://www.nature.com/articles/376680a0.epdf?sharing_token=XzA3pMyq1-90bp8IHPsDiNRgN0jAjWel9jnR3ZoTv0NjqwHPzT2EZOmoupSkNogAcZGDea6VHenadcy2ZVTQLAQygdRw7H4UC7py46oKWTeTp_jR-LXk4EUiQD6fCfvgRxa9FeT2BsqDP4gNHAHc1UOJNEfRsAF6L4Fzte3kHmnRcOOaeLbB7-DtdeGWOnUkVs0C8l8RNzNyQal8GyWw8jg93siTVTmEMCZPcazH8Z6Ugd6g-RzwR2_TN5PgL8qQP1k1RCdu4pqP8R7_z_ucaoN-S1AoVv52tqlLZZR6c5k%3D&amp;tracking_referrer=www.scientificamerican.com\"> inanuka na inaonekana kama chakula</a>."
    			},
    			{
    				p: "Mamalia wa baharini, kasa wa baharini na wanyama wengine mara nyingi huzama baada ya kunaswa katika<a href=\"https://www.fisheries.noaa.gov/alaska/marine-life-distress/pinniped-entanglement-marine-debris\"> plastiki zilizopotea au zilizotupwa</a> ikijumuisha vifaa vya upakiaji au uvuvi."
    			},
    			{
    				p: "Sababu kuu ya kifo cha<a href=\"https://www.fisheries.noaa.gov/species/north-atlantic-right-whale\"> North Atlantic right whales</a>, mojawapo ya nyangumi walio hatarini sana duniani, anategwa kwenye gia ya uvuvi ambayo haionekani vizuri."
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Pia kuna athari zisizo dhahiri sana. Sio tu kwamba sumu zinazopatikana tayari kwenye plastiki zinaathiri chakula cha baharini lakini vipande vya plastiki vinajulikana kulowesha uchafuzi ambao hutiririka kutoka ardhini hadi baharini, ikijumuisha taka ya dawa na ya viwandani. Sumu inaweza kusambazwa kupitia chakula spishi za baharini wanapokula na kuliwa. Kuna wasiwasi pia kuhusu spishi zisizo za asili juu ya takataka zinazoelea kwenye bahari kuelekea bahari na mchanga ya kigeni, kama vile mwani, moluska na chaza, ambayo inaweza kuvamia na kuharibu mazingira na spishi za majini za mbali. Shida inazidishwa na ukweli kwamba takataka nyingi za plastiki baharini mwishowe huzama kwenye bahari kama rundo la takataka, kufyonza miamba ya matumbawe na viumbe chini ya bahari."
    			}
    		]
    	},
    	{
    		type: "illo",
    		illo: "woman"
    	},
    	{
    		type: "text",
    		head: "Madhara kwa Wanadamu",
    		text: [
    			{
    				p: "Wanadamu pia wako hatarini kutokana na uchafu wa baharini na uchafuzi wa plastiki. Ubora wa mazingira imeunganishwa sana na afya ya binadamu. Kuenea kwa mikroplastiki katika sayari yetu kunaleta wasiwasi mkubwa kuhusu usalama wa watu. <a href=\"https://www.acs.org/content/acs/en/pressroom/newsreleases/2020/august/micro-and-nanoplastics-detectable-in-human-tissues.html\"> Utafiti mpya </a> unaonyesha kuwa watu wanapumua mikroplastiki hewani, wanaikula na kuinywa kwa maji na hata kuifyonza kupitia ngozi. Mikroplastiki zimepatikana ndani ya<strong>mapafu yetu, ini, wengu, na figo</strong>, na uchunguzi mmoja hivi karibuni uligundua mikroplastiki kwenye <strong> kondo</strong> ya watoto wachanga."
    			},
    			{
    				p: "Kiwango kamili cha athari kwa afya ya binadamu bado haijulikani kwani utafiti ndio unaanza tu. Hata hivyo, kuna ushahidi mkubwa kwamba kemikali zinazohusiana na plastiki, kama methyl mercury, plasticisers na vizuia moto, vinaweza kuingia mwilini na zinahusianishwa na wasiwasi wa kiafya, haswa kwa wanawake. Wanasayansi pia wanaamini kwamba baadhi ya kemikali za kawaida zinazopatikana kwenye plastiki, kama bisphenol A, phthalates, na polychlorinated biphenyls (PCBs), zinaweza kuingia mwilini. Kemikali hizi zimehusishwa na usumbufu wa endokrini, shida za ukuaji, kasoro za uzazi na saratani. Hiyo ni sababu ya kutosha kutumia tahadhari."
    			}
    		]
    	},
    	{
    		type: "pill",
    		short: "China ilipiga marufuku uagizaji wa taka nyingi za plastiki",
    		long: "Mwaka wa 2018, China ilipiga marufuku uagizaji wa taka nyingi za plastiki ili kusaidia kuboresha mazingira, ubora wa hewa na uchumi ndani ya mipaka yake, kwani takataka nyingi zimejaa kwenye maeneo ya taka au katika njia za maji na mchanga."
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Athari za uchafuzi wa plastiki hazisikiwi kwa usawa kote ulimwenguni. Nchi tajiri hutoa taka nyingi za plastiki, ambazo mara nyingi hutiririka kwenda katika nchi zinazoendelea ambapo usimamizi wa taka ni wa hali ya chini sana. Kuchakata kunaweza kusaidia kupunguza uzalishaji wa plastiki na taka za plastiki; walakini, shida kubwa ni kiwango cha chini cha kuchakata cha plastiki ulimwenguni, ambayo kwa sasa ni chini ya asilimia 10."
    			},
    			{
    				p: "Jamii katika nchi zinazoendelea zina uwezo mdogo wa kudhibiti mzigo wa uchafuzi wa plastiki kwa mazingira, afya, jamii na tamaduni kwa sababu ya ukosefu wa msaada wa serikali au fedha. Hiyo inamaanisha wanawake, watoto, wafanyikazi wa taka, jamii za pwani, Watu wa Asili na watu ambao wanategemea bahari <a href=\"https://www.unescap.org/sites/default/files/publications/CS76%20Theme%20Study.pdf\"> wanahisi athari hizo zaidi</a>, haswa wakati wa kuhama au kuchoma taka iliyosimamiwa vibaya. Inamaanisha pia uchumi huu unaathirika kwani umesongwa na plastiki."
    			},
    			{
    				p: "Plastiki baharini huathiri vibaya uwezo wa mifumo mingi ya ikolojia kutoa faida za kimsingi ambazo wanadamu hufurahia na huchukulia kuwa ya kawaida, ambazo ni kutoka maji safi hadi ufugaji wa wanyama wa majini na uvuvi, udhibiti wa wadudu na magonjwa, udhibiti wa hali ya hewa, na urithi na burudani. Kulingana na Tathmini ya Uchafuzi hadi Suluhisho, uchafuzi wa plastiki baharini hupunguza huduma muhimu ya mfumo wa ikolojia ya baharini kwa angalau Dola za Kimarekani bilioni 500 hadi Dola za Kimarekani bilioni 2,500 kila mwaka, na hiyo haijumuishi hasara zingine za kijamii na kiuchumi kama utalii na usafirishaji."
    			},
    			{
    				p: "Tathmini inaonyesha kwamba hasara za moja kwa moja za kiuchumi kwa tasnia ya pwani na baharini, kama vile uvuvi na usafirishaji, ni kubwa. Katika eneo la Mediterania, hasara hizi zimekadiriwa kuwa karibu dola za Kimarekani milioni 138 kwa mwaka. Katika eneo la Ushirikiano wa Kiuchumi wa Pasifiki ya Asia, jumla ya hasara ni Dola za Kimarekani bilioni 10.8, ongezeko la karibu mara kumi ikilinganishwa na 2009. Hata hivyo, hasara hizi hazijaripotiwa vizuri, na gharama za kweli za uchafu wa baharini na uchafuzi wa plastiki kwa binadamu, mazingira, na afya ya jamii bado zinagunduliwa."
    			}
    		]
    	},
    	{
    		type: "header",
    		head: "Plastiki na Mabadiliko ya Tabianchi",
    		video: "coral-polluted"
    	},
    	{
    		type: "pill",
    		short: "Uwiano wa mbali wa kasa wa kiume na wa kike?",
    		long: "Mikroplastiki inaweza kuongeza joto la mchanga kwenye fukwe ambapo kasa wa baharini hukaa. Kwa kuwa joto la mchanga huamua jinsia ya kasa, viota hivi vyenye joto vinaweza kubadilisha uwiano wa kasa wa kiume na wa kike ambao hutaga kwenye fukwe hizi."
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Plastiki pia ni tatizo kwa hali ya hewa. Sio kila mtu anajua kuwa plastiki hutengenezwa kutoka kwa mafuta, fueli ya visukuku. Kadri tunavyotengeneza plastiki zaidi, ndivyo mafuta zaidi ya visukuku inavyohitajika, ndivyo tunavyozidisha tatizo la hali ya hewa katika kitanzi cha maoni hasi. Pia, bidhaa za plastiki huunda uzalishaji wa gesi ya ukaa katika mzunguko wao wote wa maisha Ikiwa hakuna hatua itakayochukuliwa, uzalishaji wa gesi ya ukaa kutoka kwa uzalishaji, kutumia tena na kuchoma plastiki kunaweza kuchangia <a href=\"https://www.pewtrusts.org/-/media/assets/2020/07/breakingtheplasticwave_report.pdf\">asilimia 19 ya jumla ya uzalishaji unaoruhusiwa wa Mkataba wa Paris mnamo 2040</a> kupunguza joto hadi nyuzi 1.5 Celsius."
    			},
    			{
    				p: "Katika miaka ya hivi karibuni, kumekuwa na ongezeko la dharura kulinda bahari ili kukabiliana na mabadiliko ya tabianchi. Bahari huzamisha kiwango kikubwa zaidi cha kaboni ulimwenguni, ikihifadhi<a href=\"https://www.climate.gov/news-features/understanding-climate/climate-change-ocean-heat-content\"> asilimia 90 ya joto la ziada ambalo uzalishaji wa kaboni umenasa katika anga zetu</a> na theluthi moja ya kaboni dioksidi iliyoongezwa tangu mapinduzi ya viwanda. Kunyonya kiasi kikubwa cha kaboni kumepunguza athari zinazoonekana za sayari inayoongezeka joto - lakini pia kuharakisha athari za janga chini ya maji - bahari inayoongezeka joto, asidi na isiyo na usawa wa kemikali."
    			},
    			{
    				p: "Kaboni imefichwa katika kila sehemu ya bahari, haswa mikoko, nyasi ya bahari, matumbawe na mabwawa ya chumvi. Kadri tunavyofanya uharibifu kwa maeneo yetu ya bahari na pwani, ni vigumu zaidi kwa mifumo hii ya ikolojia kukomesha na kuhimili mabadiliko ya tabianchi."
    			},
    			{
    				p: "Kwa kutahadharisha, <a href=\"https://www.sciencedirect.com/science/article/abs/pii/S0048969721002886\"> utafiti wa hivi karibuni</a> kuhusu uchafuzi wa plastiki baharini na GRID-Arendal, mshirika wa UNEP, unaonyesha kwamba mifumo minne ya ikolojia ya pwani ambayo huhifadhi kaboni nyingi na hutumika kama vizuizi asili dhidi ya bahari zinazoongezeka na dhoruba - mikoko, nyasi za bahari, mabwawa ya chumvi na miamba ya matumbawe - yanawekwa chini ya shinikizo kutoka kwa uchafuzi wa plastiki ardhini kama matokeo ya ukaribu wao na mito. Zaidi ya hapo awali, uchunguzi na ukaguzi wa uchafu wa baharini ni muhimu kutabiri matokeo ya shinikizo, mbinu za kupunguza muundo, na kuongoza marekebisho."
    			}
    		]
    	},
    	{
    		type: "pill",
    		short: "Misitu mikubwa ya mikoko",
    		long: "<a href=\"https://www.sciencedaily.com/releases/2011/04/110404173247.htm\"> Misitu ya mikoko pwani huhifadhi kaboni zaidi kwa kila eneo la kitengo kuliko karibu msitu mwingine wowote Duniani</a>."
    	},
    	{
    		type: "header",
    		video: "waste"
    	},
    	{
    		type: "maandishi",
    		text: [
    			{
    				p: "Uchafuzi mwingi, uharibifu wa bayoanuwai, na tabianchi isiyo thabiti ndilo tatizo kubwa zaidi la sayari kwa wakati wetu. Ukuaji wa haraka wa uzalishaji wa plastiki tayari unaleta vitisho kwa mifumo ya asili ya Dunia, ambayo maisha inategemea, na inakadiriwa kuwa mbaya zaidi. Kufikia 2040, taka za plastiki zinatarajiwa kutoa hatari ya kila mwaka ya kifedha ya Dola za Kimarekani bilioni 100 kwa biashara ambazo zitahitaji kubeba gharama za usimamizi wa taka kwa kiwango kinachotarajiwa. Inakadiriwa kuwa <a href=\"https://www.eionet.europa.eu/etcs/etc-wmge/products/impact-of-covid-19-on-single-use-plastics-and-the-environment-in-europe\" target=\"_blank\"> nchini Italia peke yake, kati ya tani elfu 160,000 na 440,000 za taka za ziada</a> zilizalishwa mnamo 2020 kwa sababu ya kutegemea zaidi<strong> vifaa vya kinga ya matibabu wakati wa janga la Covid-19</strong>. Ikiwa asilimia 1 tu ya barakoa ya matumizi moja inayochangia takwimu hii ingetupwa vibaya, hadi barakoa milioni 10 zinaweza kuingia na kuchafua bahari kwa mwezi."
    			},
    			{
    				p: "Wakati idadi ya plastiki baharini ambazo tunahitaji kushughulikia ni kubwa sana ni vigumu kuwazia, sayansi inatuambia kuwa suluhisho nyingi tunazohitaji tayari zipo. Shughuli nyingi za kikanda, kitaifa, na za mitaa zinasaidia kupunguza mtiririko wa plastiki kwenye bahari, kama vile Mikataba ya Bahari ya Kikanda, marufuku ya kitaifa juu ya bidhaa za plastiki zinazotumiwa mara moja, 3><a href=\"https://ellenmacarthurfoundation.org/topics/the-global-commitment/overview\">ahadi za biashara na serikali kupunguza </a>, kuunda upya na kutumia tena bidhaa za plastiki, kuongeza plastiki iliyotumiwa tena katika bidhaa mpya, mipango ya kando, na marufuku ya mifuko ya manispaa."
    			},
    			{
    				p: "\"<a href=\"https://www.pewtrusts.org/en/research-and-analysis/articles/2020/07/23/breaking-the-plastic-wave-top-findings\" target=\"_blank\"> Kuvunja Wimbi la Plastiki</a>\", tathmini ya ulimwengu ya jinsi ya kubadilisha mwelekeo wa taka ya plastiki, inaonyesha kwamba tunaweza kupunguza kiwango cha plastiki inayoingia baharini kwa asilimia 80 katika miongo miwili ijayo ikiwa tutatumia teknolojia na suluhisho zilizopo."
    			},
    			{
    				p: "Kuendelea na mambo kama kawaida sio chaguo. Tathmini ya \"Uchafuzi hadi suluhisho\" inaelezea kuwa kiwango cha tatizo kinahitaji kujitolea kwa haraka na hatua katika kiwango cha ulimwengu, kote kwa mzunguko wa plastiki na kutoka kwa chanzo hadi bahari kufikia upunguzaji wa taka wa muda mrefu."
    			}
    		]
    	},
    	{
    		type: "big-text",
    		text: [
    			{
    				illo: "small-illos-02",
    				p: "Kuboresha mifumo ya usimamizi wa taka ili miundomsingi sahihi ipatikane kupokea taka za plastiki na kuhakikisha sehemu kubwa inaweza kutumika tena."
    			},
    			{
    				illo: "small-illos-03",
    				p: "Boresha mbinu za mviringo kwa kukuza matumizi endelevu zaidi na mazoea ya uzalishaji katika mnyororo mzima wa thamani ya plastiki."
    			},
    			{
    				illo: "small-illos-04",
    				p: "Shirikisha watumiaji katika kushughulikia uchafuzi wa plastiki ili kushawishi soko na kuhamasisha mabadiliko ya tabia."
    			},
    			{
    				illo: "small-illos-05",
    				p: "Anza utaratibu kwa kuondoa vitu vya plastiki visivyo vya lazima, vinavyoweza kuepukwa na zinazosumbua na kuzibadilisha na vifaa mbadala, bidhaa na huduma."
    			},
    			{
    				illo: "small-illos-06",
    				p: "Shughulikia urithi kupitia ufuatiliaji mzuri ili kutambua vyanzo, idadi na hatima ya plastiki."
    			},
    			{
    				illo: "small-illos-07",
    				p: "Kuboresha na kuimarisha utawala katika ngazi zote."
    			},
    			{
    				illo: "small-illos-08",
    				p: "Boresha maarifa na uangalie ufanisi kwa kutumia sayansi."
    			},
    			{
    				illo: "small-illos-09",
    				p: "Kuboresha fedha kwa msaada wa kiufundi na kujenga uwezo."
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Mikataba na makubaliano kadhaa iliyoko ya kimataifa tayari yanatoa msaada wa kupunguza uchafuzi wa bahari, kupambana na mabadiliko ya tabianchi (SDG 13), na kutumia bahari kwa njia endelevu (SDG 14). Ushirikiano wa Ulimwenguni juu ya Uchafu wa Baharini, Mkataba wa Umoja wa Mataifa juu ya Sheria ya Bahari, na Mkataba wa Utofauti wa Kibayolojia unahusiana moja kwa moja na afya ya bahari, mifumo yake ya ikolojia na viumbe vya baharini. Mikataba ya Basel, Stockholm na Rotterdam inahusiana na harakati na utupaji wa taka na kemikali hatari. Pia kuna kasi inayoongezeka ya makubaliano ya ulimwengu kuhusu uchafu wa baharini na uchafuzi wa plastiki ili kukabiliana na janga hili."
    			},
    			{
    				p: "Hakuna suluhisho moja. Kama ilivyo na mashambulio mengi ya mazingira ya kizazi, hii inahitaji mifumo ya kufikiria, uvumbuzi na mabadiliko. Hata hivyo, lengo ni moja: kupunguza matumizi ya plastiki zisizo za lazima, zinazoweza kuepukwa na zinazosumbua, na usimamishe mtiririko wao katika maziwa, mito, ardhi oevu, pwani na bahari. Sisi sote tuko pamoja kwa hili, na kwa pamoja, tunaweza, lazima, tusuluhishe tatizo la uchafu wa baharini na uchafuzi wa plastiki."
    			}
    		]
    	},
    	{
    		type: "download",
    		head: "Pakua ripoti ya UNEP: Kutoka Uchafuzi hadi Suluhisho: tathmini ya ulimwengu ya uchafu wa baharini na uchafuzi wa plastiki",
    		cover: "cover",
    		other: "Nyenzo zingine (picha zenye habari)",
    		downloadlink: "https://wedocs.unep.org/xmlui/bitstream/handle/20.500.11822/36963/POLSOL.pdf",
    		furtherlink: "https://www.unep.org/resources/pollution-solution-global-assessment-marine-litter-and-plastic-pollution",
    		further: "Rasilimali zingine"
    	},
    	{
    		type: "footer",
    		head: "Jiunge na UNEP kuchukua hatua sasa!",
    		text: [
    			{
    				p: "Bunge <a href=\"https://www.unep.org/environmentassembly/about-united-nations-environment-assembly\"> la Mazingira la Umoja wa Mataifa</a> (UNEA) ndilo chombo cha ngazi ya juu kabisa cha kufanya uamuzi kuhusu mazingira, likiwa na wanachama wa nchi zote 193.  Bunge linaweka vipaumbele kwa sera za mazingira za ulimwengu, hutengeneza sheria ya kimataifa ya mazingira, hutoa uongozi, huchochea kuchukuliwa hatua kati ya serikali kuhusu mazingira, na inachangia utekelezaji wa<a href=\"https://sustainabledevelopment.un.org/\"> Ajenda ya UN ya 2030 ya Maendeleo Endelevu</a>. Tathmini hii ya kihistoria itazihimiza serikali katika UNEA-5.2 ijayo mnamo Februari 2022, kuchukua hatua madhubuti, ya ulimwengu kushughulikia tatizo la plastiki.  Kuthibitishwa na Mpango wa Mazingira wa UN utakuwezesha kushiriki. Mashirika yanahimizwa kutuma maombi ya idhini hivi karibuni ili yaweze kushughulikiwa kwa wakati. Pata maelezo zaidi<a href=\"https://www.unep.org/civil-society-engagement/accreditation\">hapa</a>."
    			},
    			{
    				p: "Imetoka katika kazi ya muda mrefu ya UNEP na <a href=\"https://unep-marine-litter.vercel.app/\">Ushirikiano wa Duniani juu ya Uchafu wa Bahari </a>, the <a href=\"https://www.cleanseas.org/\">Kampeni ya Bahari safi </a>inaunganisha na kukusanya watu binafsi, vikundi vya kijamii, viwanda na serikali ili kuchochea mabadiliko na kubadilisha tabia, mazoea, viwango na sera kote ulimwenguni ili kupunguza kwa kasi uchafu baharini na athari zake.  Hadi sasa, nchi 63 zimejiunga, na zaidi ya watu laki moja wamejihusisha na kampeni hiyo kupitia ahadi za utekelezaji, na mwingiliano wa mitandao ya kijamii.  Tafuta jinsi ya kujiunga na kuchukua ahadi ya #CleanSeas<a href=\"https://www.cleanseas.org/make-pledge\"> hapa</a>."
    			},
    			{
    				p: "The <a href=\"https://www.gpmarinelitter.org/\"> Ushirikiano wa Ulimwenguni juu ya Uchafu wa Baharini</a> (GPML) huleta pamoja wahusika wote wanaofanyia kazi uchafu wa baharini na kuzuia uchafuzi wa plastiki. Vyombo vyote vinavyofanya kazi kushughulikia suala hili la haraka ulimwenguni vimealikwa kujiunga na GPML<a href=\"https://www.gpmarinelitter.org/who-we-are/members/sign-up\"> hapa</a>. Jukwaa la Kidijitali la GPML ni chanzo wazi, lenye washikadau wengi ambalo linakusanya rasilimali tofauti, linaunganisha wadau na linajumuisha data kuongoza hatua, kwa lengo la kukuza upatikanaji sawa wa data, habari, teknolojia na uvumbuzi.  Gundua zaidi na ujiunge<a href=\"https://digital.gpmarinelitter.org/\">hapa</a>!"
    			},
    			{
    				p: "<a href=\"https://ellenmacarthurfoundation.org/topics/the-global-commitment/overview\"> Ahadi ya Uchumi Mpya wa Plastiki</a>  huunganisha biashara, serikali, na mashirika mengine kwenye mnyororo wa thamani wa plastiki nyuma yake<a href=\"https://emf.thirdlight.com/link/86tanzqdbppx-8rdpns/@/preview/1?o\">a common vision</a> na hulenga kushughulikia taka za plastiki na uchafuzi wa mazingira kwenye chanzo chake. Inaongozwa na <a href=\"https://ellenmacarthurfoundation.org/\">Wakfu wa Ellen MacArthur</a> kwa ushirikiano na <a href=\"https://www.unep.org/\">UNEP</a>. Waliotia sahihi wanajitolea kuchukua hatua maalum KUONDOA plastiki ambayo hatuihitaji; KUVUMBUA kuhakikisha kuwa bidhaa za plastiki tunazohitaji zinatumika tena, au zinaweza kuoza; na KUZUNGUSHA vitu vyote vya plastiki tunavyotumia kuviweka kwenye uchumi na mbali na mazingira."
    			},
    			{
    				p: "Mpango<a href=\"https://www.oneplanetnetwork.org/sustainable-tourism/global-tourism-plastics-initiative\"> wa Plastiki za Utalii Ulimwenguni</a> (GTPI) ni kiunga cha Ahadi ya Ulimwenguni na sekta ya Utalii. Zaidi ya mashirika 600 pamoja na serikali 20 kutoka ulimwenguni kote na zaidi ya biashara 350 zinazowakilisha zaidi ya asilimia 20 ya vifungashio vya plastiki vilivyotumika ulimwenguni ni watia sahihi wa Ahadi ya Ulimwenguni na GTPI."
    			},
    			{
    				p: "Mpango <a href=\"https://www.oneplanetnetwork.org/one-planet-network-wide-plastics-initiative\"> wa One Planet Network-Wide Plastics </a> unakuza vitendo katika hadithi ya kawaida ambayo hujengwa juu ya ushahidi na maarifa yaliyotolewa na UNEP, wakati wa kutumia utaalam tofauti na ushirikiano ndani ya programu za One Planet network. Upakiaji wa plastiki katika hatua ya matumizi ya mnyororo wa thamani ya plastiki ndio kiingilio muhimu cha kuweka majibu ya pamoja ya mtandao."
    			}
    		]
    	}
    ];
    var resources$1 = [
    ];
    var menu$2 = [
    	{
    		item: "Pakua ripoti",
    		short: "Pakua",
    		link: "https://wedocs.unep.org/xmlui/bitstream/handle/20.500.11822/36963/POLSOL.pdf"
    	}
    ];
    var meta$2 = {
    	title: "Kutoka Uchafuzi hadi Suluhisho",
    	url: "unep.org/interactive/pollution-to-solution",
    	description: "Tathmini kali ya afya, uchumi, mifumo ya ikolojia, wanyama pori na vitisho vya hali ya hewa na suluhisho zinazohusiana na uchafu wa bahari na uchafuzi wa plastiki.",
    	keywords: "Plastiki kwenye Fukwe, Bahari safi, Uchafuzi wa Bahari, Uchafuzi wa Plastiki, Taka katika Bahari, Uchafu wa Plastiki, Vyanzo vya Uchafuzi wa Maji"
    };
    var storySW = {
    	article: article$1,
    	resources: resources$1,
    	menu: menu$2,
    	meta: meta$2
    };

    var article = [
    	{
    		type: "intro",
    		head: "Da Poluição<br/> <b>à Solução</b>",
    		video: "intro",
    		text: [
    			{
    				p: "O que o ponto mais profundo do oceano, <b>as Fossas Marianas</b>, e o pico de montanha mais alto do mundo, <b>Monte Everest, têm em comum</b>?"
    			},
    			{
    				p: "Apesar de estarem entre os ecossistemas mais remotos e inacessíveis do planeta, <b>estes dois possuem pequenos pedaços de plástico provenientes de atividades humanas</b> a quilômetros de distância."
    			},
    			{
    				p: "<b>Plásticos</b> são a maior, mais prejudicial e mais persistente parcela do lixo no mar, representando pelo menos <b>85 por cento do total de lixo no mar</b>."
    			},
    			{
    				p: "O lixo no mar é encontrado em <b>volumes crescentes</b> ao longo de nossas costas e estuários, em gigantescas correntes meso-oceânicas, em ilhas remotas, no gelo marinho..."
    			},
    			{
    				p: "... atravessando o fundo do mar, desde as regiões polares até as fossas mais profundas e escuras, <b> prejudicando a vida marinha</b> e danificando habitats pelo caminho."
    			}
    		]
    	},
    	{
    		type: "series",
    		tag: "Esta história faz parte de uma série do PNUMA que mostra como a humanidade pode viver em mais harmonia com a natureza, em um planeta livre de poluição e com um clima estável.",
    		kicker: "Mais histórias da série",
    		stories: [
    			{
    				item: "Vida Abaixo d’Água",
    				link: "https://www.unep.org/interactive/status-world-coral-reefs/"
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Durante os últimos 70 anos, o plástico - um material extremamente maleável, versátil e durável - infiltrou-se no mercado e alcançou, aparentemente, todos os recantos da Terra. O plástico pode proporcionar benefícios importantes, em aplicações que vão desde equipamentos médicos que salvam vidas até o armazenamento seguro e duradouro de alimentos. Entretanto, produtos plásticos desnecessários e evitáveis, particularmente embalagens de uso único e itens descartáveis, estão poluindo nosso planeta a taxas alarmantes. Décadas de crescimento econômico e uma crescente dependência de produtos plásticos descartáveis têm levado a uma enxurrada de resíduos não gerenciados que se espalham por lagos, rios, áreas costeiras e, até mesmo, pelo mar, provocando uma série de problemas."
    			},
    			{
    				p: "<strong><a href=\"\">Da Poluição à Solução: Uma análise global sobre lixo marinho e poluição plástica </a></strong> mostra que existe uma ameaça crescente em todos os ecossistemas desde a produção até o mar. Mostra também que, embora tenhamos o conhecimento, precisamos da vontade política e da ação urgente dos governos para enfrentar a crise crescente. O relatório informará as ações prioritárias na Assembleia da ONU para o Meio Ambiente (UNEA 5.2) em 2022, onde os países se reunirão para decidir um caminho para a cooperação global. O novo relatório da ONU adverte que, a menos que consigamos lidar com nosso problema de plásticos:"
    			}
    		]
    	},
    	{
    		type: "scrolly-video",
    		video: "litter",
    		text: [
    			{
    				p: "Sem uma ação urgente, as 11 milhões de toneladas de plástico que hoje chegam ao oceano anualmente triplicarão nos próximos vinte anos."
    			},
    			{
    				p: "Isto significaria entre 23 e 37 milhões de toneladas de plástico escoando para o oceano todos os anos até 2040."
    			},
    			{
    				p: "Isso equivale a 50 quilos de plástico por metro de litoral em todo o mundo ..."
    			},
    			{
    				p: "… ou o peso de 178 Symphony of the Seas, o maior navio de cruzeiro do mundo."
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "O problema surge durante uma crise global que requer atenção e ações imediatas e sustentáveis. Esta avaliação nos dá o alerta definitivo para a onipresença do lixo no mar e os impactos adversos da poluição plástica - da degradação ambiental às perdas econômicas para as comunidades e indústrias, aos riscos à saúde humana - e nos mostra como podemos fazer melhor. É hora de darmos as mãos para reverter a maré no que se refere ao lixo no mar e à poluição plástica, implementando as muitas - grandes e pequenas - soluções disponíveis, com urgência, inovação, compromisso e responsabilidade."
    			}
    		]
    	},
    	{
    		type: "pill",
    		short: "Quão pequenos são os microplásticos e nanoplásticos?",
    		long: "Microplásticos e nanoplásticos são pedaços de plásticos que medem de 5 milímetros a poucos nanômetros."
    	},
    	{
    		type: "text",
    		head: "Prejuízo à Vida Marinha",
    		text: [
    			{
    				p: "O lixo no mar e a poluição plástica são problemáticos por muitas razões. Os plásticos não se biodegradam (decomposição natural sem gerar resíduos prejudiciais ao meio ambiente). Em vez disso, eles se decompõem com o tempo em pedaços cada vez menores conhecidos como microplásticos e nanoplásticos, que podem ter impactos prejudiciais significativos."
    			},
    			{
    				p: "Os impactos na vida marinha variam de danos físicos ou químicos a animais específicos, a efeitos mais amplos sobre a biodiversidade e o funcionamento do ecossistema. Pedaços de plástico foram encontrados no sistema digestivo de muitos seres aquáticos, inclusive em todas as espécies de tartarugas marinhas e em quase metade das espécies de aves marinhas e mamíferos marinhos pesquisados."
    			}
    		]
    	},
    	{
    		type: "scrolly-video",
    		video: "harm_to_animals",
    		text: [
    			{
    				p: "Tartarugas marinhas confundem sacolas plásticas com água-viva, lentamente morrendo de fome enquanto seus estômagos se enchem de lixo indigesto."
    			},
    			{
    				p: "Aves marinhas bicam plásticos porque eles<a href=\"https://www.nature.com/articles/376680a0.epdf?sharing_token=XzA3pMyq1-90bp8IHPsDiNRgN0jAjWel9jnR3ZoTv0NjqwHPzT2EZOmoupSkNogAcZGDea6VHenadcy2ZVTQLAQygdRw7H4UC7py46oKWTeTp_jR-LXk4EUiQD6fCfvgRxa9FeT2BsqDP4gNHAHc1UOJNEfRsAF6L4Fzte3kHmnRcOOaeLbB7-DtdeGWOnUkVs0C8l8RNzNyQal8GyWw8jg93siTVTmEMCZPcazH8Z6Ugd6g-RzwR2_TN5PgL8qQP1k1RCdu4pqP8R7_z_ucaoN-S1AoVv52tqlLZZR6c5k%3D&amp;tracking_referrer=www.scientificamerican.com\">têm cheiro e aparência de comida</a>."
    			},
    			{
    				p: "Mamíferos marinhos, tartarugas marinhas e outros animais muitas vezes se afogam após ficarem presos em <a href=\"https://www.fisheries.noaa.gov/alaska/marine-life-distress/pinniped-entanglement-marine-debris\">plásticos perdidos ou descartados</a> incluindo embalagens ou artigos de pesca."
    			},
    			{
    				p: "Uma das principais causas de morte para a<a href=\"https://www.fisheries.noaa.gov/species/north-atlantic-right-whale\">Baleia-franca-do-atlântico-norte</a>, uma das baleias mais ameaçadas do mundo, é ficar atolada em redes de pesca fantasma."
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Há impactos menos óbvios também. Não apenas as toxinas já encontradas nos plásticos afetam a teia alimentar oceânica, mas também se sabe que os pedaços de plástico absorvem os poluentes que escoam da terra para o mar, incluindo os resíduos farmacêuticos e industriais. A toxicidade pode se transferir através da cadeia alimentar à medida que as espécies marinhas se alimentam e se tornam alimento. Há também uma preocupação crescente sobre as espécies não nativas que atravessam o oceano em busca de lixo que flutua em mares e solos estrangeiros, tais como algas, moluscos e cracas, que podem invadir e degradar ambientes e espécies aquáticas distantes. O problema é agravado pelo fato de que a maioria do lixo plástico no oceano eventualmente naufraga como uma pilha de lixo submersa, sufocando os recifes de corais e a vida marinha no fundo do mar."
    			}
    		]
    	},
    	{
    		type: "illo",
    		illo: "woman"
    	},
    	{
    		type: "text",
    		head: "Prejuízos à humanidade",
    		text: [
    			{
    				p: "Os seres humanos também estão em risco devido ao lixo no mar e à poluição plástica. A saúde ambiental está intrinsecamente ligada à saúde humana. A onipresença dos microplásticos em todo o nosso planeta suscita sérias preocupações quanto à segurança das pessoas. <a href=\"https://www.acs.org/content/acs/en/pressroom/newsreleases/2020/august/micro-and-nanoplastics-detectable-in-human-tissues.html\">Nova pesquisa</a> mostra que as pessoas estão inalando microplásticos através do ar, consumindo-os através de alimentos e água e até mesmo absorvendo-os através da pele. Microplásticos foram encontrados até mesmo dentro de<strong>nossos pulmões, fígados, baços e rins</strong>e um estudo recente encontrou microplásticos em <strong> placentas</strong> de recém-nascidos."
    			},
    			{
    				p: "A extensão total do impacto na saúde humana ainda é desconhecida, uma vez que a pesquisa é incipiente. Há, entretanto, evidências substanciais de que produtos químicos associados aos plásticos, tais como metilmercúrio, plastificantes e retardantes de chama, podem entrar no corpo e estão ligados a problemas de saúde, especialmente nas mulheres. Os cientistas também acreditam que alguns dos produtos químicos comuns encontrados nos plásticos, tais como bisfenol A, ftalatos e bifenilos policlorados (PCBs), são capazes de penetrar no corpo. Estes produtos químicos têm sido ligados à disrupção endócrina, desordens de desenvolvimento, anormalidades reprodutivas e câncer. Isso é razão suficiente para que se adote uma abordagem preventiva."
    			}
    		]
    	},
    	{
    		type: "pill",
    		short: "China baniu a importação da maior parte de lixo plástico",
    		long: "Em 2018, a China baniu a importação da maior parte de lixo plástico a fim de ajudar a melhorar o meio ambiente, a qualidade do ar e a economia dentro de suas fronteiras, já que a maior parte do lixo acabava em aterros sanitários ou em hidrovias e no solo."
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Os impactos da poluição plástica não são sentidos igualmente em todo o mundo. Países mais ricos produzem mais resíduos plásticos, que com grande frequência escoam para países menos desenvolvidos, onde a gestão de resíduos é menos sofisticada. A reciclagem pode ajudar a reduzir a produção de plástico e os resíduos plásticos; no entanto, um grande problema é a baixa taxa de reciclagem de plásticos em todo o mundo, que atualmente é inferior a 10%."
    			},
    			{
    				p: "As populações dos países em desenvolvimento são as menos capazes de administrar a carga ambiental, sanitária, social e cultural da poluição plástica, devido à falta de apoio ou fundos governamentais. Isso significa que mulheres, crianças, catadores e catadoras de material reciclável, comunidades costeiras, povos indígenas e pessoas que dependem do oceano <a href=\"https://www.unescap.org/sites/default/files/publications/CS76%20Theme%20Study.pdf\">sentem os impactos mais intensamente</a>, particularmente quando transportam ou queimam lixo mal administrado. Isto também significa que estas economias sofrem, pois são sufocadas pelo plástico."
    			},
    			{
    				p: "Os plásticos marinhos impactam negativamente a capacidade de uma multiplicidade de ecossistemas de proporcionar os benefícios básicos que os seres humanos desfrutam, mas consideram como dados, que vão desde água limpa até aquicultura e pesca produtiva, controle de pragas e doenças, regulação climática, e patrimônio e recreação. De acordo com a avaliação Da Poluição à Solução, a poluição plástica marinha reduz serviços valiosos atrelados ao ecossistema marinho em pelo menos U$500 bilhões a U$2.500 bilhões por ano, e isso não inclui outras perdas sociais e econômicas, como o turismo e a navegação."
    			},
    			{
    				p: "A avaliação destaca que as perdas econômicas diretas para as indústrias costeira e marítima, tais como a pesca e o transporte marítimo, são significativas. Na região do Mediterrâneo, estas perdas foram estimadas em cerca de US$138 milhões por ano. Na região da Cooperação Econômica Ásia-Pacífico, as perdas totalizam US$10,8 bilhões, um aumento de quase dez vezes em relação a 2009. No entanto, estas perdas não são bem reportadas, e os custos reais do lixo no mar e da poluição plástica na saúde humana, ambiental e social ainda estão sendo descobertos."
    			}
    		]
    	},
    	{
    		type: "header",
    		head: "Plásticos e Mudança climática",
    		video: "coral-polluted"
    	},
    	{
    		type: "pill",
    		short: "Desproporcionalidade entre tartarugas macho e fêmea?",
    		long: "Os microplásticos podem elevar a temperatura da areia nas praias onde as tartarugas marinhas fazem seus ninhos. Como a temperatura da areia determina o sexo das tartarugas, ninhos mais quentes podem alterar a proporção de tartarugas machos e fêmeas que chocam nestas praias."
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Os plásticos também são um problema climático. Nem todos sabem que o plástico é essencialmente produzido a partir do petróleo, um combustível fóssil. Quanto mais plástico produzimos, mais combustível fóssil é necessário, e mais intensificamos a crise climática em um contínuo ciclo prejudicial. Além disso, a produção de plástico cria emissões de gases de efeito estufa ao longo de todo o seu ciclo de vida. Se nenhuma ação for tomada, as emissões de gases de efeito estufa da produção, reciclagem e incineração de plásticos poderiam ser responsáveis por  <a href=\"https://www.pewtrusts.org/-/media/assets/2020/07/breakingtheplasticwave_report.pdf\">19% do total de emissões definidas pelo Acordo de Paris em 2040</a> para limitar o aquecimento a 1,5 graus Celsius."
    			},
    			{
    				p: "Nos últimos anos, tem havido uma urgência crescente para proteger o oceano e os mares, a fim de combater a mudança climática. O oceano é o maior reservatório de carbono do planeta, armazenando <a href=\"https://www.climate.gov/news-features/understanding-climate/climate-change-ocean-heat-content\"> até 90 por cento do calor adicional que as emissões de carbono têm retido em nossa atmosfera</a> e um terço do dióxido de carbono adicional gerado desde a revolução industrial. A absorção de grandes quantidades de carbono retardou os impactos visíveis de um planeta em aquecimento - mas também acelerou os efeitos catastróficos abaixo da superfície da água - um oceano aquecido, acidificado e quimicamente desequilibrado."
    			},
    			{
    				p: "O carbono é capturado em todos os elementos do oceano, especialmente manguezais, gramas marinhas, corais e pântanos salgados. Quanto mais danos fazemos às nossas áreas oceânicas e costeiras, mais difícil é para estes ecossistemas tanto compensar como permanecer resistentes às mudanças climáticas."
    			},
    			{
    				p: "De forma alarmante, <a href=\"https://www.sciencedirect.com/science/article/abs/pii/S0048969721002886\">um estudo recente</a> sobre a poluição marinha por plástico pela GRID-Arendal, parceira do PNUMA, indica que os quatro ecossistemas costeiros que armazenam mais carbono e servem como barreiras naturais contra a subida dos mares e tempestades - manguezais, gramas marinhas, pântanos salgados e recifes de corais - estão sendo colocados sob pressão da poluição plástica terrestre como consequência de sua proximidade com os rios. Mais do que nunca, o levantamento e a pesquisa de lixo no mar são essenciais para prever as consequências das pressões, projetar abordagens de mitigação e orientar a adaptação."
    			}
    		]
    	},
    	{
    		type: "pill",
    		short: "Florestas de manguezais saudáveis",
    		long: "<a href=\"https://www.sciencedaily.com/releases/2011/04/110404173247.htm\">As florestas de manguezais saudáveis armazenam mais carbono por unidade de área do que quase qualquer outra floresta na Terra</a>."
    	},
    	{
    		type: "header",
    		head: "Da poluição plástica à solução",
    		video: "waste"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "A poluição desenfreada, o colapso da biodiversidade e a mudança climática são as crises planetárias mais urgentes de nosso tempo. O rápido crescimento da produção de plástico já representa ameaças aos sistemas naturais da Terra, dos quais a vida depende, e a projeção é de piora. Até 2040, espera-se que os resíduos plásticos apresentem um risco financeiro anual de 100 bilhões de dólares para as empresas que precisariam arcar com os custos da gestão de resíduos. Estima-se que <a href=\"https://www.eionet.europa.eu/etcs/etc-wmge/products/impact-of-covid-19-on-single-use-plastics-and-the-environment-in-europe\" target=\"_blank\"> só na Itália, entre 160.000 e 440.000 toneladas de resíduos adicionais</a> foram produzidas em 2020 devido à intensificação da dependência de equipamentos médicos <strong>protetivos durante a pandemia de Covid-19</strong>. Se apenas 1% das máscaras de uso único que contribuem para este número fossem descartadas indevidamente, até 10 milhões de máscaras poderiam penetrar e poluir o oceano por mês."
    			},
    			{
    				p: "Embora a quantidade de plásticos no mar que precisamos enfrentar seja tão grande a ponto de ser difícil de acompanhar, a ciência nos diz que a maioria das soluções de que precisamos já existem. Inúmeras atividades regionais, nacionais e locais estão ajudando a reduzir o fluxo de plásticos para o oceano, tais como as Convenções Marinhas Regionais, proibições nacionais de produtos plásticos de uso único, compromisso de<a href=\"https://ellenmacarthurfoundation.org/topics/the-global-commitment/overview\">empresas e governos</a> para reduzir, redesenhar e reutilizar os produtos plásticos, aumentar o conteúdo de plástico reciclado em novos produtos, iniciativas municipais de contenção e proibições de sacolas."
    			},
    			{
    				p: "\"<a href=\"https://www.pewtrusts.org/en/research-and-analysis/articles/2020/07/23/breaking-the-plastic-wave-top-findings\" target=\"_blank\">Quebrando a Onda de Plástico</a>\", uma análise global de como mudar a trajetória dos resíduos plásticos, revela que podemos reduzir a quantidade de plástico que entra no oceano em cerca de 80% nas próximas duas décadas, se utilizarmos as tecnologias e soluções existentes."
    			},
    			{
    				p: "Continuar com as mesmas atitudes de sempre (business-as-usual) simplesmente não é uma opção. A avaliação Da Poluição à Solução explica que a escala do problema exige compromissos e ações urgentes a nível global, em todo o ciclo de vida do plástico, e da produção até o mar para alcançar a redução necessária de resíduos a longo prazo."
    			}
    		]
    	},
    	{
    		type: "big-text",
    		text: [
    			{
    				illo: "small-illos-02",
    				p: "Melhorar os sistemas de gestão de resíduos para que a infraestrutura correta esteja disponível para receber os resíduos plásticos e garantir que uma alta proporção possa ser reutilizada ou reciclada."
    			},
    			{
    				illo: "small-illos-03",
    				p: "Melhorar a circularidade promovendo práticas de consumo e produção mais sustentáveis em toda a cadeia de valor do plástico."
    			},
    			{
    				illo: "small-illos-04",
    				p: "Envolver os consumidores no combate à poluição plástica para influenciar o mercado e inspirar mudanças comportamentais."
    			},
    			{
    				illo: "small-illos-05",
    				p: "Fechar a torneira eliminando itens de plástico desnecessários, evitáveis e problemáticos, substituindo-os por materiais, produtos e serviços alternativos."
    			},
    			{
    				illo: "small-illos-06",
    				p: "Lidar com o legado através de um monitoramento eficaz para identificar fontes, quantidades e o destino dos plásticos."
    			},
    			{
    				illo: "small-illos-07",
    				p: "Melhorar e fortalecer a governança em todos os níveis."
    			},
    			{
    				illo: "small-illos-08",
    				p: "Aumentar o conhecimento e monitorar a eficácia usando ciência rigorosa."
    			},
    			{
    				illo: "small-illos-09",
    				p: "Melhorar o financiamento com assistência técnica e desenvolvimento de capacidades."
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Vários acordos e convenções internacionais existentes já fornecem apoio para reduzir a poluição marinha, combater a mudança climática (ODS 13) e utilizar os oceanos de forma sustentável (ODS 14). A Parceria Global sobre Lixo no mar, a Convenção das Nações Unidas sobre o Direito do Mar e a Convenção sobre Diversidade Biológica estão diretamente relacionadas com a saúde do oceano, seus ecossistemas e a vida marinha. As convenções da Basiléia, Estocolmo e Roterdão estão relacionadas ao transporte e ao descarte de resíduos perigosos e produtos químicos. Há também uma forte tendência para um acordo global sobre lixo no mar e poluição plástica para combater este problema."
    			},
    			{
    				p: "Não há uma solução única. Como em muitas violações ambientais intergeracionais, isto requer pensamento, inovação e transformação dos sistemas. Entretanto, o objetivo é único: reduzir o uso de plásticos desnecessários, evitáveis e problemáticos, e interromper seu escoamento para nossos lagos, rios, pântanos, costas e mares. Estamos no mesmo barco, e não só podemos, mas devemos resolver o lixo no mar e o problema da poluição plástica."
    			}
    		]
    	},
    	{
    		type: "download",
    		head: "Faça o download do relatório do PNUMA: Da Poluição à Solução: uma análise global sobre lixo marinho e poluição plástica",
    		cover: "cover",
    		other: "Infográficos",
    		further: "Outros recursos",
    		downloadlink: "https://wedocs.unep.org/xmlui/bitstream/handle/20.500.11822/36963/POLSOL.pdf",
    		furtherlink: "https://www.unep.org/resources/pollution-solution-global-assessment-marine-litter-and-plastic-pollution"
    	},
    	{
    		type: "footer",
    		head: "Junte-se ao PNUMA para agir agora!",
    		text: [
    			{
    				p: "A <a href=\"https://www.unep.org/environmentassembly/about-united-nations-environment-assembly\">Assembleia da ONU para o Meio Ambiente </a> (UNEA) é o órgão decisório de mais alto nível do mundo sobre o meio ambiente, com uma filiação universal de todos os 193 Estados Membros. A Assembleia estabelece prioridades para políticas ambientais globais, desenvolve o direito ambiental internacional, proporciona liderança, catalisa a ação intergovernamental sobre o meio ambiente e contribui para a implementação da <a href=\"https://sustainabledevelopment.un.org/\">Agenda 2030 das Nações Unidas para o Desenvolvimento Sustentável</a>. Esta avaliação histórica incitará os governos na próxima UNEA-5.2, em fevereiro de 2022, a tomar medidas decisivas e globais para enfrentar a crise do plástico. O credenciamento junto ao Programa das Nações Unidas para o Meio Ambiente permitirá a sua participação. As organizações são encorajadas a enviar pedidos de credenciamento em breve para que possam ser processados a tempo. Saiba mais <a href=\"https://www.unep.org/civil-society-engagement/accreditation\">aqui</a>."
    			},
    			{
    				p: "Enraizada no trabalho de longa data do PNUMA e da <a href=\"https://unep-marine-litter.vercel.app/\">Parceria Global sobre Lixo no Mar (GPML)</a>, a <a href=\"https://www.cleanseas.org/\">Campanha Mares Limpos</a> está conectando e mobilizando indivíduos, grupos da sociedade civil, indústria e governos para catalisar mudanças e transformar hábitos, práticas, padrões e políticas em todo o mundo para reduzir drasticamente o lixo no mar e seus impactos negativos. Até hoje, 63 países aderiram, e mais de cem mil indivíduos se comprometeram com a campanha através de promessas de ação, compromissos e interações nas mídias sociais. Descubra como aderir e assumir o compromisso #MaresLimpos <a href=\"https://www.cleanseas.org/make-pledge\">aqui</a>."
    			},
    			{
    				p: "A <a href=\"https://www.gpmarinelitter.org/\">Parceria Global sobre Lixo no mar</a> (GPML) reúne todos os atores que trabalham com lixo no mar e prevenção e redução da poluição plástica. Todas as entidades que trabalham para tratar desta questão global urgente estão convidadas a se juntar ao GPML <a href=\"https://www.gpmarinelitter.org/who-we-are/members/sign-up\">aqui</a>. A Plataforma Digital GPML é uma plataforma de código aberto multistakeholder que compila diferentes recursos, conecta as partes interessadas e integra dados para orientar a ação, com o objetivo de promover o acesso equitativo aos dados, informações, tecnologia e inovação. Descubra mais e junte-se a <a href=\"https://digital.gpmarinelitter.org/\">aqui</a>!"
    			},
    			{
    				p: "O <a href=\"https://www.oneplanetnetwork.org/sustainable-tourism/global-tourism-plastics-initiative”>Compromisso Global pela Nova Economia do Plástico</a> une empresas, governos e outras organizações ao longo da cadeia de valor do plástico em torno <a href=\"https://emf.thirdlight.com/link/86tanzqdbppx-8rdpns/@/preview/1?o\">de uma visão comum</a> e visa a abordar o resíduo plástico e a poluição em sua fonte. Ela é liderada pela Fundação <a href=\"https://ellenmacarthurfoundation.org/\">Ellen MacArthur</a> em colaboração com <a href=\"https://www.unep.org/\">PNUMA</a>. Os signatários se comprometem a tomar ações específicas para ELIMINAR o plástico que não precisamos; INOVAR para garantir que os produtos plásticos de que precisamos sejam reutilizáveis, recicláveis ou compostáveis; e CIRCULAR todos os itens plásticos que usamos para mantê-los na economia e fora do meio ambiente."
    			},
    			{
    				p: "A <a href=\"https://www.oneplanetnetwork.org/sustainable-tourism/global-tourism-plastics-initiative\">Iniciativa Global para a Circularidade do Plásticos no Turismo</a> (GTPI) é a interface do Compromisso Global com o setor de Turismo. Mais de 600 organizações, incluindo 20 governos de todo o mundo, e mais de 350 empresas representando mais de 20% das embalagens plásticas utilizadas globalmente são signatárias do Compromisso Global e do GTPI."
    			},
    			{
    				p: "A iniciativa<a href=\"https://www.oneplanetnetwork.org/one-planet-network-wide-plastics-initiative\"> One Planet Network-Wide Plastics</a> promove ações através de uma narrativa comum que se baseia nas evidências e conhecimentos produzidos pelo PNUMA, ao mesmo tempo em que alavanca os diferentes conhecimentos e parcerias dentro dos programas da rede One Planet. A embalagem plástica na fase de uso da cadeia de valor do plástico é o principal ponto de entrada para estruturar a resposta coletiva da rede."
    			}
    		]
    	}
    ];
    var resources = [
    ];
    var menu$1 = [
    	{
    		item: "Download do relatório",
    		short: "Download",
    		link: "https://wedocs.unep.org/xmlui/bitstream/handle/20.500.11822/36963/POLSOL.pdf"
    	}
    ];
    var meta$1 = {
    	title: "Da Poluição à Solução",
    	url: "unep.org/interactive/pollution-to-solution",
    	description: "Uma avaliação rigorosa de várias ameaças à saúde, economia, ecossistema, vida selvagem e clima e soluções associadas ao lixo no mar e poluição plástica.",
    	keywords: "Plástico nas Praias, Mares Limpos, Poluição Oceânica, Poluição Plástica, Lixo no Oceano, Resíduos Plásticos, Fontes de Poluição da Água"
    };
    var storyPT = {
    	article: article,
    	resources: resources,
    	menu: menu$1,
    	meta: meta$1
    };

    const params = new URLSearchParams(window.location.search);
    const langs = ['EN', 'ES', 'FR', 'ID', 'PT', 'RU', 'ZH', 'AR', 'SW', 'PT'];
    const lang = (params.has('lang') && langs.some(l => params.get('lang') === l))?params.get('lang'):'EN';

    const url = {
      EN:storyEN,
      ES:storyES,
      FR:storyFR,
      ID:storyID,
      PT:storyPT,
      RU:storyRU,
      ZH:storyZH,
      AR:storyAR,
      SW:storySW
    };

    const json = url[lang];
    const content = json.article;
    const menu = json.menu;
    const meta = json.meta;
    const intro = json.intro;
    meta.lang = lang.toLowerCase();

    const app = new App({
      target: document.body,
      props: {
        content: content,
        meta: meta,
        intro: intro,
        lang: lang.toLowerCase(),
        menu: menu
      }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
