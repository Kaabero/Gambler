const { test, describe, expect, beforeEach, afterEach } = require('@playwright/test')


describe('Registeration and login to Gambler app', () => {

    beforeEach(async ({ request }) => {

        await request.post('http://localhost:3001/api/testing/insert')
        await request.post('http://localhost:3001/api/users', {
          data: {
            username: 'admin',
            password: 'Password1!',
            admin:true
          }
        })
    
    })

    afterEach(async ({ request }) => {
        await request.post('http:localhost:3001/api/testing/reset')
    })

    test('login page can be opened', async ({ page }) => {
        await page.goto('http://localhost:5173/login')
        await expect(page.getByText('Welcome to the Gambler app!')).toBeVisible()
    
    })

    test('user can log in', async ({ page }) => {
        await page.goto('http://localhost:5173/login')
        await page.getByTestId('username').fill('admin')
        await page.getByTestId('password').fill('Password1!')
        await page.getByRole('button', { name: 'Login' }).click()
        await expect(page.getByText('admin logged in')).toBeVisible()
    })

    test('user cannot log in with wrong credentials', async ({ page }) => {
        await page.goto('http://localhost:5173/login')
        await page.getByTestId('username').fill('admin')
        await page.getByTestId('password').fill('Password')
        await page.getByRole('button', { name: 'Login' }).click()
        await expect(page.getByText('Wrong credentials')).toBeVisible()
        
    })

    test('create account link works before loggin in', async ({ page }) => {
        await page.goto('http://localhost:5173/login')
        await page.getByRole('link', { name: 'Create account' }).click()
    })


    test('user can register', async ({ page }) => {
        await page.goto('http://localhost:5173/register')
        await page.getByTestId('username').fill('user')
        await page.getByTestId('password').fill('Password1!')
        await page.getByRole('button', { name: 'Create account' }).click()
        await expect(page.getByText('New user user created successfully!')).toBeVisible()
    })

    test('user cannot register if username is taken', async ({ page }) => {
        await page.goto('http://localhost:5173/register')
        await page.getByTestId('username').fill('admin')
        await page.getByTestId('password').fill('Password1!')
        await page.getByRole('button', { name: 'Create account' }).click()
        await expect(page.getByText('Username already taken')).toBeVisible()
    })

    test('user cannot register if password validation fails', async ({ page }) => {
        await page.goto('http://localhost:5173/register')
        await page.getByTestId('username').fill('user')
        await page.getByTestId('password').fill('Password')
        await page.getByRole('button', { name: 'Create account' }).click()
        await expect(page.getByText('Password must be at least 8 characters')).toBeVisible()
    })

    describe('when logged in', () => {
        beforeEach(async ({ page }) => {
          await page.goto('http://localhost:5173/login')
          await page.getByTestId('username').fill('admin')
          await page.getByTestId('password').fill('Password1!')
          await page.getByRole('button', { name: 'Login' }).click()
          await expect(page.getByText('admin logged in')).toBeVisible()
          await page.goto('http://localhost:5173')
        })
    
        test('a home page can be opened', async ({ page }) => {
            await expect(page.getByText('Welcome to the Gambler app!')).toBeVisible()
            await expect(page.getByText('The current administrators are:')).toBeVisible()
            page.getByRole('button', { name: 'Logout' }).toBeVisible()

        }) 
        
        test('a  user can logout', async ({ page }) => {
            page.getByRole('button', { name: 'Logout' }).click()
            await expect(page.getByText('You are logged out')).toBeVisible()


        })
    })      

})
