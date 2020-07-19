describe('library', () => {
    it('can be imported', async () => {
        await expect(import('../src')).resolves.toBeDefined();
    });
});
