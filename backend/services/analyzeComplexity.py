import os
import sys
from clang import cindex
import tempfile

# Try to find LLVM installation based on OS
try:
    import platform
    system = platform.system()

    if system == 'Windows':
        llvm_path = r"C:\Program Files\LLVM\bin"
        lib_name = "libclang.dll"
    elif system == 'Linux':
        llvm_path = "/usr/lib/llvm-12/lib"
        lib_name = "libclang.so.1"
    elif system == 'Darwin':  # macOS
        llvm_path = "/usr/local/opt/llvm/lib"
        lib_name = "libclang.dylib"
    else:
        llvm_path = ""
        lib_name = ""

    if llvm_path and os.path.exists(llvm_path):
        cindex.Config.set_library_file(os.path.join(llvm_path, lib_name))
except Exception as e:
    print(f"Failed to configure LLVM: {e}", file=sys.stderr)
    # Continue with default paths as fallback


def count_loops_and_allocations(node, loop_count=0, alloc_count=0, recursion=False, func_name=None):
    if node.kind in [cindex.CursorKind.FOR_STMT, cindex.CursorKind.WHILE_STMT]:
        loop_count += 1

    elif node.kind == cindex.CursorKind.CALL_EXPR:
        # Try to get callee name robustly
        callee = node.get_definition()
        callee_name = callee.spelling.lower() if callee and callee.spelling else node.spelling.lower()

        if callee_name == func_name:
            recursion = True

        if "alloc" in callee_name or callee_name in ['malloc', 'calloc']:
            alloc_count += 1

    elif node.kind == cindex.CursorKind.CXX_NEW_EXPR:
        alloc_count += 1

    for child in node.get_children():
        loop_count, alloc_count, recursion = count_loops_and_allocations(
            child, loop_count, alloc_count, recursion, func_name)

    return loop_count, alloc_count, recursion


def analyze_function(function_node):
    func_name = function_node.spelling
    return count_loops_and_allocations(function_node, func_name=func_name)


def analyze_cpp_code(code):
    with tempfile.NamedTemporaryFile(mode='w+', suffix='.cpp', delete=False) as temp:
        temp.write(code)
        temp.flush()
        temp_path = temp.name

    try:
        index = cindex.Index.create()
        tu = index.parse(temp_path)

        if not tu:
            return "O(1),O(1)"

        if len(tu.diagnostics) > 0:
            for diag in tu.diagnostics:
                print(f"Diagnostic: {diag}", file=sys.stderr)

        total_loops = 0
        total_allocs = 0
        has_recursion = False

        for node in tu.cursor.get_children():
            if node.kind == cindex.CursorKind.FUNCTION_DECL and node.is_definition():
                loops, allocs, recursion = analyze_function(node)
                total_loops += loops
                total_allocs += allocs
                has_recursion = has_recursion or recursion

        # Heuristic rules
        if has_recursion:
            time_complexity = "O(2^n)"
        elif total_loops >= 2:
            time_complexity = "O(n^2)"
        elif total_loops == 1:
            time_complexity = "O(n)"
        else:
            time_complexity = "O(1)"

        space_complexity = "O(n)" if total_allocs > 0 else "O(1)"

        return f"{time_complexity},{space_complexity}"

    finally:
        os.unlink(temp_path)


if __name__ == "__main__":
    code = sys.stdin.read()
    result = analyze_cpp_code(code)
    print(result)
