<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AssetController extends Controller
{
    public function index()
    {
        return response()->json(
            Asset::latest()->paginate(10)
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'asset_code' => ['required', 'string', 'max:255', 'unique:assets,asset_code'],
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'brand' => ['nullable', 'string', 'max:255'],
            'serial_number' => ['nullable', 'string', 'max:255'],
            'status' => ['sometimes', Rule::in(['available', 'assigned', 'maintenance'])],
            'purchase_date' => ['nullable', 'date'],
            'purchase_cost' => ['nullable', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
        ]);

        $asset = Asset::create($validated);

        return response()->json([
            'message' => 'Asset created successfully.',
            'data' => $asset,
        ], 201);
    }

    public function show(Asset $asset)
    {
        return response()->json([
            'data' => $asset,
        ]);
    }

    public function update(Request $request, Asset $asset)
    {
        $validated = $request->validate([
            'asset_code' => [
                'sometimes', 'required', 'string', 'max:255',
                Rule::unique('assets', 'asset_code')->ignore($asset->id),
            ],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'category' => ['sometimes', 'required', 'string', 'max:255'],
            'brand' => ['nullable', 'string', 'max:255'],
            'serial_number' => ['nullable', 'string', 'max:255'],
            'status' => ['sometimes', Rule::in(['available', 'assigned', 'maintenance'])],
            'purchase_date' => ['nullable', 'date'],
            'purchase_cost' => ['nullable', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
        ]);

        $asset->update($validated);

        return response()->json([
            'message' => 'Asset updated successfully.',
            'data' => $asset->fresh(),
        ]);
    }

    public function destroy(Asset $asset)
    {
        $asset->delete();

        return response()->json([
            'message' => 'Asset deleted successfully.',
        ]);
    }
}
