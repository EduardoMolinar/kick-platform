/**
 * Remote entry point — two-file bootstrap required by Module Federation.
 * Shared singletons are initialized before Angular bootstraps.
 */
import('./bootstrap').catch((err) => console.error(err));
