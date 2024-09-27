const { test, describe, expect, beforeEach, afterEach } = require('@playwright/test')


describe('When admin has logged in to Gambler app', () => {

    let tournamentId

    beforeEach(async ({ page, request }) => {

        const response = await request.post('http://localhost:3001/api/testing/insert')
  

        const id  = await response.json()
        tournamentId = id.toString()
        
        
        await request.post('http://localhost:3001/api/users', {
          data: {
            username: 'admin',
            password: 'Password1!',
            admin:true
          }
        })
        await page.goto('http://localhost:5173/login')
        await page.getByTestId('username').fill('admin')
        await page.getByTestId('password').fill('Password1!')
        await page.getByRole('button', { name: 'Login' }).click()
        await expect(page.getByText('admin logged in')).toBeVisible()
        await page.goto('http://localhost:5173')
    
    })

    afterEach(async ({ page, request }) => {
        await request.post('http:localhost:3001/api/testing/reset')
    })



    test('a home page can be opened', async ({ page }) => {
        await expect(page.getByText('Welcome to the Gambler app!')).toBeVisible()
        await expect(page.getByText('The current administrators are:')).toBeVisible()
        await expect(page.getByText('admin logged in')).toBeVisible()
        await expect(page.getByText('testAdmin')).toBeVisible()
        await expect(page.getByText('Tournaments')).toBeVisible()
        page.getByRole('button', { name: 'Logout' })

    })
        
    test('admin tools can be opened', async ({ page }) => {
        await page.getByRole('link', { name: 'Admin tools' }).click()
        await expect(page.getByText('Add a new tournament')).toBeVisible()
        page.getByRole('button', { name: 'Go back' })
    })
        
    test('new tournament can be added', async ({ page }) => {
        await page.getByRole('link', { name: 'Admin tools' }).click()
        await page.getByRole('link', { name: 'Add a new tournament' }).click()
        await page.getByTestId('tournamentname').fill('testTournament')
        const dateFromInput = page.locator('input[data-testid="from"]')
        await expect(dateFromInput).toBeVisible()
        await dateFromInput.fill('2100-01-01')
            
        const dateToInput = page.locator('input[data-testid="to"]')
        await expect(dateToInput).toBeVisible()
        await dateToInput.fill('2101-01-01')
        await page.getByRole('button', { name: 'Add' }).click()
        await expect(dateFromInput).toHaveValue('2100-01-01')
        await expect(dateToInput).toHaveValue('2101-01-01')
        await expect(page.getByText('Tournament added successfully!')).toBeVisible()
      
    })

    test('a tournament can be deleted', async ({ page }) => {
        await page.getByRole('link', { name: 'Admin tools' }).click()
        await page.getByRole('link', { name: 'Edit and remove tournaments' }).click()
        await expect(page.getByRole('radio', { name: `Don't show ended tournaments` })).toBeVisible()
        await expect(page.getByRole('radio', { name: `Show all tournaments` })).toBeVisible()
        await expect(page.getByRole('radio', { name: 'Hide admin tools' })).toBeVisible()
        await expect(page.getByRole('radio', { name: 'Show admin tools' })).toBeVisible()
        await page.getByRole('radio', { name: 'Show all tournaments' }).click()
        await page.getByRole('radio', { name: 'Show admin tools' }).click()
        await expect(page.getByRole('button', { name: 'Delete tournament' })).toBeVisible()
        page.on('dialog', async (dialog) => {
            await dialog.accept()
        })
        await page.getByRole('button', { name: 'Delete tournament' }).click()
        await expect(page.getByText('Tournament deleted successfully!')).toBeVisible()
        await expect(page.getByText('There are no tournaments')).toBeVisible()
      
    })

    test('a tournament can be edited', async ({ page }) => {
        await page.getByRole('link', { name: 'Admin tools' }).click()
        await page.getByRole('link', { name: 'Edit and remove tournaments' }).click()
        await page.getByRole('radio', { name: 'Show all tournaments' }).click()
        await page.getByRole('radio', { name: 'Show admin tools' }).click()
        await expect(page.getByRole('button', { name: 'Edit tournament' })).toBeVisible()
        await page.getByRole('button', { name: 'Edit tournament' }).click()
        await expect(page.getByText('Edit the tournament')).toBeVisible()
        await page.getByTestId('tournamentname').fill('Edited tournament')
        const dateFromInput = page.locator('input[data-testid="from"]')
        await expect(dateFromInput).toBeVisible()
        const dateToInput = page.locator('input[data-testid="to"]')
        await expect(dateToInput).toBeVisible()
        await page.getByRole('button', { name: 'Save' }).click()
        await expect(page.getByText('Tournament updated successfully!')).toBeVisible()
        await expect(page.getByText('Edited tournament')).toBeVisible()
      
    })

    test('a game can be added', async ({ page }) => {
        const dropdown = page.locator('#tournament-select')
        await expect(dropdown).toBeVisible()
        await dropdown.click()
        await dropdown.selectOption({ value: tournamentId })
        await expect(dropdown).toHaveValue(tournamentId)
        await page.getByRole('link', { name: 'Admin tools' }).click()
        await page.getByRole('link', { name: 'Add a new game' }).click()
        await expect(page.getByText('Add a new game')).toBeVisible()
        const dateInput = page.locator('input[data-testid="date"]')
        await expect(dateInput).toBeVisible()
        await dateInput.fill('2100-01-01T15:30');
        await page.getByTestId('hometeam').fill('Home')
        await page.getByTestId('visitorteam').fill('Visitor')

        await expect(dateInput).toBeVisible()
        await page.getByRole('button', { name: 'Add' }).click()
        await expect(dateInput).toHaveValue('2100-01-01T15:30')
        await expect(page.getByText('Game added successfully!')).toBeVisible()
        await page.goto('http://localhost:5173/games')
        await expect(page.getByText('Home')).toBeVisible()
      
    })

    test('a game can be deleted', async ({ page }) => {
        const dropdown = page.locator('#tournament-select')
        await expect(dropdown).toBeVisible()
        await dropdown.click()
        await dropdown.selectOption({ value: tournamentId })
        await expect(dropdown).toHaveValue(tournamentId)
        await page.getByRole('link', { name: 'Admin tools' }).click()
        await page.getByRole('link', { name: 'Edit and remove games, add game results' }).click()
        await expect(page.getByRole('radio', { name: 'Hide admin tools' })).toBeVisible()
        await expect(page.getByRole('radio', { name: 'Show admin tools' })).toBeVisible()
        await expect(page.getByText('upcoming')).toBeVisible()
        await page.getByRole('radio', { name: 'Show admin tools' }).click()
        await expect(page.getByRole('button', { name: 'Delete game' })).toBeVisible()
        page.on('dialog', async (dialog) => {
            await dialog.accept()
        })
        await page.getByRole('button', { name: 'Delete game' }).click()
        await expect(page.getByText('Game deleted successfully!')).toBeVisible()
        await expect(page.getByText('upcoming')).not.toBeVisible()
      
    })

    test('a game can be edited', async ({ page }) => {
        const dropdown = page.locator('#tournament-select')
        await expect(dropdown).toBeVisible()
        await dropdown.click()
        await dropdown.selectOption({ value: tournamentId })
        await expect(dropdown).toHaveValue(tournamentId)
        await page.getByRole('link', { name: 'Admin tools' }).click()
        await page.getByRole('link', { name: 'Edit and remove games, add game results' }).click()
        await expect(page.getByRole('radio', { name: 'Hide admin tools' })).toBeVisible()
        await expect(page.getByRole('radio', { name: 'Show admin tools' })).toBeVisible()
        await expect(page.getByText('upcoming')).toBeVisible()
        await page.getByRole('radio', { name: 'Show admin tools' }).click()
        await expect(page.getByRole('button', { name: 'Edit game' })).toBeVisible()
        await page.getByRole('button', { name: 'Edit game' }).click()
        await expect(page.getByText('Edit the game')).toBeVisible()
        await page.getByTestId('hometeam').fill('EditedHome')
        await page.getByRole('button', { name: 'Save' }).click()
        await expect(page.getByText('Game updated successfully!')).toBeVisible()
        await expect(page.getByText('EditedHome')).toBeVisible()
          
    })

    test('a game result and scores can be added', async ({ page }) => {
        const dropdown = page.locator('#tournament-select')
        await expect(dropdown).toBeVisible()
        await dropdown.click()
        await dropdown.selectOption({ value: tournamentId })
        await expect(dropdown).toHaveValue(tournamentId)
        await page.getByRole('link', { name: 'Admin tools' }).click()
        await page.getByRole('link', { name: 'Edit and remove games, add game results' }).click()
        await expect(page.getByRole('radio', { name: 'Hide admin tools' })).toBeVisible()
        await expect(page.getByRole('radio', { name: 'Show admin tools' })).toBeVisible()
        await page.getByRole('radio', { name: 'Show all games' }).click()
        await expect(page.getByText('without')).toBeVisible()
        await page.getByRole('radio', { name: 'Show admin tools' }).click()
        await expect(page.getByRole('button', { name: 'Add result and points' })).toBeVisible()
        await page.getByRole('button', { name: 'Add result and points' }).click()
        await expect(page.getByText('Add result:')).toBeVisible()

        const homeGoalsInput = page.locator('input[data-testid="home_goals"]')
        await expect(homeGoalsInput).toBeVisible()
        await homeGoalsInput.fill("1")
                
        const visitorGoalsInput = page.locator('input[data-testid="visitor_goals"]')
        await expect(visitorGoalsInput).toBeVisible()
        await visitorGoalsInput.fill("1")
    
        await page.getByRole('button', { name: 'Add result and points' }).click()
        await expect(homeGoalsInput).toHaveValue("1")
        await expect(visitorGoalsInput).toHaveValue("1")
        await expect(page.getByText('Outcome and scores added successfully!')).toBeVisible()
        await page.goto('http://localhost:5173/points')
        await expect(page.getByText('1 - 1')).toBeVisible()
        await expect(page.getByText('3')).toBeVisible()
          
    })

    test('a game result and scores can be deleted', async ({ page }) => {
        const dropdown = page.locator('#tournament-select')
        await expect(dropdown).toBeVisible()
        await dropdown.click()
        await dropdown.selectOption({ value: tournamentId })
        await expect(dropdown).toHaveValue(tournamentId)
        await page.getByRole('link', { name: 'Admin tools' }).click()
        await page.getByRole('link', { name: 'Delete game results and related scores' }).click()

        await expect(page.getByRole('radio', { name: 'Hide admin tools' })).toBeVisible()
        await expect(page.getByRole('radio', { name: 'Show admin tools' })).toBeVisible()
        await expect(page.getByText('past')).toBeVisible()
        await page.getByRole('radio', { name: 'Show admin tools' }).click()


        await expect(page.getByRole('button', { name: 'Delete the result and related scores' })).toBeVisible()
        page.on('dialog', async (dialog) => {
            await dialog.accept()
        })
        await page.getByRole('button', { name: 'Delete the result and related scores' }).click()

        await expect(page.getByText('Result and related scores deleted successfully!')).toBeVisible()
        await expect(page.getByText('past')).not.toBeVisible()
          
    })

    test('points can be edited', async ({ page }) => {
        const dropdown = page.locator('#tournament-select')
        await expect(dropdown).toBeVisible()
        await dropdown.click()
        await dropdown.selectOption({ value: tournamentId })
        await expect(dropdown).toHaveValue(tournamentId)
        await page.getByRole('link', { name: 'Admin tools' }).click()
        await page.getByRole('link', { name: 'Edit received points' }).click()

        await expect(page.getByRole('radio', { name: 'Hide admin tools' })).toBeVisible()
        await expect(page.getByRole('radio', { name: 'Show admin tools' })).toBeVisible()
        await expect(page.getByText('88')).toBeVisible()
        await page.getByRole('radio', { name: 'Show admin tools' }).click()
        await expect(page.getByRole('button', { name: 'Edit points' })).toBeVisible()
        await page.getByRole('button', { name: 'Edit points' }).click()
        await expect(page.getByText('Edit the points')).toBeVisible()
        await expect(page.getByText('88')).toBeVisible()

        const editPointsInput = page.locator('input[data-testid="points"]')
        await expect(editPointsInput).toBeVisible()
        await editPointsInput.fill("99")
           
        await page.getByRole('button', { name: 'Save' }).click()
        await expect(editPointsInput).toHaveValue("99")

        await expect(page.getByText('Scores edited successfully!')).toBeVisible()
        
        await expect(page.getByText('99')).toBeVisible()
           
        await expect(page.getByText('88')).not.toBeVisible()
          
    })

    test('a user can be deleted', async ({ page }) => {
        const dropdown = page.locator('#tournament-select')
        await expect(dropdown).toBeVisible()
        await dropdown.click()
        await dropdown.selectOption({ value: tournamentId })
        await expect(dropdown).toHaveValue(tournamentId)
        await page.getByRole('link', { name: 'Admin tools' }).click()
        await page.getByRole('link', { name: 'Remove users, add admin rights' }).click()

        await expect(page.getByRole('radio', { name: 'Hide admin tools' })).toBeVisible()
        await expect(page.getByRole('radio', { name: 'Show admin tools' })).toBeVisible()
        await page.getByRole('radio', { name: 'Show admin tools' }).click()
        await expect(page.getByRole('radio', { name: 'Show all users' })).toBeVisible()
        await page.getByRole('radio', { name: 'Show all users' }).click()
        await expect(page.getByText('testUser')).toBeVisible()
        const button = page.getByRole('button', { name: 'Delete user' })
        await expect(button).toBeVisible()
        page.on('dialog', async (dialog) => {
            await dialog.accept()
        })
        await button.click()
        await expect(page.getByText('User deleted successfully!')).toBeVisible()
        await expect(page.getByText('testUser')).not.toBeVisible()
          
    })

    test('a user can be edited', async ({ page }) => {
        const dropdown = page.locator('#tournament-select')
        await expect(dropdown).toBeVisible()
        await dropdown.click()
        await dropdown.selectOption({ value: tournamentId })
        await expect(dropdown).toHaveValue(tournamentId)
        await page.getByRole('link', { name: 'Admin tools' }).click()
        await page.getByRole('link', { name: 'Remove users, add admin rights' }).click()

        await expect(page.getByRole('radio', { name: 'Hide admin tools' })).toBeVisible()
        await expect(page.getByRole('radio', { name: 'Show admin tools' })).toBeVisible()
        await page.getByRole('radio', { name: 'Show admin tools' }).click()
        await expect(page.getByRole('radio', { name: 'Show all users' })).toBeVisible()
        await page.getByRole('radio', { name: 'Show all users' }).click()
        await expect(page.getByText('testUser')).toBeVisible()
        const button = page.getByRole('button', { name: 'Give admin rights' })
        await expect(button).toBeVisible()
        await button.click()
        await expect(page.getByText('User updated successfully!')).toBeVisible()
        await page.getByRole('radio', { name: 'Show admin tools' }).click()
        await expect(page.getByRole('radio', { name: 'Show all users' })).toBeVisible()
        await page.getByRole('radio', { name: 'Show all users' }).click()
        await expect(page.getByText('testUser')).toBeVisible()
        await expect(page.getByRole('button', { name: 'Give admin rights' })).not.toBeVisible()
          
    })
})





