<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsersController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::controller(AuthController::class)->group(function () {
    Route::post('/register', 'Register');
    Route::post('/login', 'Login');
    Route::post('/logout', 'logout');
});
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [UsersController::class, 'UserAuth']);
    Route::middleware("checkAdmin")->controller(UsersController::class)->group(function () {
        Route::get('/users', 'getAllUsers');
        Route::get("/user/{id}", 'getUser');
        Route::post('/user/add',  'addUser');
        Route::put('/user/update/{id}', 'updateUser');
        Route::delete('/user/{id}', 'deleteUser');
    });
});