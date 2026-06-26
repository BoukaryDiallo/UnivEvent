<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionController extends Controller
{
    //

    public function index()
    {
        return inertia('Users/Permissions', [
            'permissions' => Permission::all(),
            'roles' => Role::with('permissions')->get(),
        ]);
    }

    public function store(Request $request)
    {
        Permission::create([
            'name' => $request->name,
        ]);

        return back();
    }

    public function assignerPermisson(Request $request)
    {
        $data = $request->validate([
            'role' => ['required', 'string', 'exists:roles,name'],
            'permissions' => ['required', 'array'],
        ]);

        $role = Role::findByName($data['role']);

        $permissions = Permission::whereIn('name', $data['permissions'])->get();

        $role->syncPermissions($permissions);

        return back();
    }
}
