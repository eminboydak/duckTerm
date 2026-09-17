// ── Scripting ────────────────────────────────────────────────

#[tauri::command]
pub fn script_run(source: String) -> Result<String, String> {
    let mut engine = rhai::Engine::new();
    engine.set_max_operations(10_000);
    engine.set_max_expr_depths(64, 32);
    let ast = engine.compile(&source).map_err(|e| e.to_string())?;
    let result: rhai::Dynamic = engine.eval_ast(&ast).map_err(|e| e.to_string())?;
    Ok(result.to_string())
}
