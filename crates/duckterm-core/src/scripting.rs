use rhai::Engine;
use std::sync::{Arc, Mutex};

/// Script engine wrapper. Compiles and runs scripts on demand.
pub struct ScriptEngine {
    engine: Engine,
}

impl ScriptEngine {
    pub fn new() -> Self {
        let mut engine = Engine::new();
        engine.set_max_operations(10_000);
        engine.set_max_expr_depths(64, 32);
        Self { engine }
    }

    /// Compile and run a script source string in one shot.
    pub fn eval(&self, source: &str) -> Result<String, String> {
        let ast = self.engine.compile(source).map_err(|e| e.to_string())?;
        let result: rhai::Dynamic = self.engine.eval_ast(&ast).map_err(|e| e.to_string())?;
        Ok(result.to_string())
    }

    /// Compile a script and return the AST for later use.
    pub fn compile(&self, source: &str) -> Result<String, String> {
        self.engine.compile(source).map_err(|e| e.to_string())?;
        Ok("compiled".to_string())
    }
}

impl Default for ScriptEngine {
    fn default() -> Self {
        Self::new()
    }
}

/// Shared script engine for Tauri state.
pub type SharedScriptEngine = Arc<Mutex<ScriptEngine>>;

/// Create a new shared script engine.
pub fn new_script_engine() -> SharedScriptEngine {
    Arc::new(Mutex::new(ScriptEngine::new()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_eval() {
        let engine = ScriptEngine::new();
        let result = engine.eval("let x = 42; x").unwrap();
        assert_eq!(result, "42");
    }

    #[test]
    fn test_compile_error() {
        let engine = ScriptEngine::new();
        let result = engine.eval("let x = ;");
        assert!(result.is_err());
    }

    #[test]
    fn test_string_operations() {
        let engine = ScriptEngine::new();
        let result = engine.eval(r#"let s = "hello world"; to_upper(s)"#).unwrap();
        assert_eq!(result, "HELLO WORLD");
    }

    #[test]
    fn test_loop_limit() {
        let engine = ScriptEngine::new();
        let result = engine.eval("let x = 0; while x < 100000 { x += 1; } x");
        assert!(result.is_err());
    }

    #[test]
    fn test_compile_separate() {
        let engine = ScriptEngine::new();
        engine.compile("fn add(a, b) { a + b }").unwrap();
    }
}
