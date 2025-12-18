import { prisma } from '../lib/db';
import { uploadToR2 } from '../lib/upload-utils';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function migrate() {
    console.log('🚀 Starting migration of Base64 images to R2...');

    try {
        const notes = await prisma.note.findMany({
            where: {
                OR: [
                    { imageUrl: { startsWith: 'data:image/' } },
                    { content: { startsWith: 'data:image/' } },
                ],
            },
        });

        console.log(`Found ${notes.length} notes needing migration.`);

        let successCount = 0;
        let failCount = 0;

        for (const note of notes) {
            try {
                console.log(`\nProcessing Note ID: ${note.id}...`);
                const updateData: any = {};

                // Migrate imageUrl if it's base64
                if (note.imageUrl && note.imageUrl.startsWith('data:image/')) {
                    console.log('Migrating imageUrl...');
                    const contentType = note.imageUrl.substring(5, note.imageUrl.indexOf(';'));
                    const newUrl = await uploadToR2(note.imageUrl, `note-image-${note.id}-${Date.now()}`, contentType);
                    updateData.imageUrl = newUrl;
                }

                // Migrate content if it's base64 (for IMAGE notes)
                if (note.type === 'IMAGE' && note.content.startsWith('data:image/')) {
                    console.log('Migrating content (image)...');
                    const contentType = note.content.substring(5, note.content.indexOf(';'));
                    const newUrl = await uploadToR2(note.content, `note-content-${note.id}-${Date.now()}`, contentType);
                    updateData.content = newUrl;
                }

                if (Object.keys(updateData).length > 0) {
                    await prisma.note.update({
                        where: { id: note.id },
                        data: updateData,
                    });
                    console.log(`✅ Successfully migrated Note ${note.id}`);
                    successCount++;
                }
            } catch (err) {
                console.error(`❌ Failed to migrate Note ${note.id}:`, err);
                failCount++;
            }
        }

        console.log('\n--- Migration Summary ---');
        console.log(`Total: ${notes.length}`);
        console.log(`Success: ${successCount}`);
        console.log(`Failed: ${failCount}`);
        console.log('-------------------------');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

migrate();
