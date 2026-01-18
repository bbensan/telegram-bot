import os
import logging
from flask import Flask, request
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, Bot
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes
import aiohttp
import asyncio

# Setup logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Environment variables
BOT_TOKEN = os.getenv('BOT_TOKEN')
COOLIFY_API_URL = os.getenv('COOLIFY_API_URL')
COOLIFY_API_TOKEN = os.getenv('COOLIFY_API_TOKEN')
WEBHOOK_URL = os.getenv('WEBHOOK_URL', 'https://bot-cdn.cdn-gate.com')
PORT = int(os.getenv('PORT', 3000))

# Validate required environment variables
if not BOT_TOKEN:
    logger.error('❌ BOT_TOKEN is not set!')
    exit(1)

if not WEBHOOK_URL:
    logger.error('❌ WEBHOOK_URL is not set!')
    exit(1)

# Flask app untuk webhook
app = Flask(__name__)

# Telegram bot
bot = Bot(token=BOT_TOKEN)
application = None

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /start command"""
    welcome_message = """Hello, welcome to CDNGate Notifier Bot 👋
What can I help you today?"""
    
    keyboard = [
        [
            InlineKeyboardButton("📦 View Apps", callback_data='view_apps'),
            InlineKeyboardButton("📊 Status", callback_data='check_status')
        ],
        [
            InlineKeyboardButton("❓ Help", callback_data='show_help')
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(welcome_message, reply_markup=reply_markup)

async def apps(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /apps command"""
    try:
        async with aiohttp.ClientSession() as session:
            headers = {'Authorization': f'Bearer {COOLIFY_API_TOKEN}'}
            async with session.get(f'{COOLIFY_API_URL}/applications', headers=headers) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    message = '📦 Active Applications:\n\n'
                    for app_item in data:
                        message += f"• {app_item.get('name', 'Unknown')} - {app_item.get('status', 'Unknown')}\n"
                    await update.message.reply_text(message)
                else:
                    await update.message.reply_text('❌ Failed to fetch applications')
    except Exception as error:
        logger.error(f'Error fetching apps: {error}')
        await update.message.reply_text('❌ Failed to fetch applications')

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle button callbacks"""
    query = update.callback_query
    await query.answer()
    
    if query.data == 'view_apps':
        try:
            async with aiohttp.ClientSession() as session:
                headers = {'Authorization': f'Bearer {COOLIFY_API_TOKEN}'}
                async with session.get(f'{COOLIFY_API_URL}/applications', headers=headers) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        message = '📦 Active Applications:\n\n'
                        for app_item in data:
                            message += f"• {app_item.get('name', 'Unknown')} - {app_item.get('status', 'Unknown')}\n"
                        await query.edit_message_text(text=message)
                    else:
                        await query.answer('❌ Failed to fetch applications', show_alert=True)
        except Exception as error:
            logger.error(f'Error fetching apps: {error}')
            await query.answer('❌ Failed to fetch applications', show_alert=True)
    
    elif query.data == 'check_status':
        status_message = """📊 Application Status Check

Please select an application to check its status:"""
        keyboard = [[InlineKeyboardButton("⬅️ Back", callback_data='back_to_menu')]]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await query.edit_message_text(text=status_message, reply_markup=reply_markup)
    
    elif query.data == 'show_help':
        help_message = """❓ Help & Information

Available Features:
📦 View Apps - See all active applications
📊 Status - Check application status
❓ Help - Show this help message

For more information, contact the administrator."""
        keyboard = [[InlineKeyboardButton("⬅️ Back", callback_data='back_to_menu')]]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await query.edit_message_text(text=help_message, reply_markup=reply_markup)
    
    elif query.data == 'back_to_menu':
        welcome_message = """Hello, welcome to CDNGate Notifier Bot 👋
What can I help you today?"""
        keyboard = [
            [
                InlineKeyboardButton("📦 View Apps", callback_data='view_apps'),
                InlineKeyboardButton("📊 Status", callback_data='check_status')
            ],
            [
                InlineKeyboardButton("❓ Help", callback_data='show_help')
            ]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await query.edit_message_text(text=welcome_message, reply_markup=reply_markup)

async def setup_webhook():
    """Setup webhook for Telegram"""
    try:
        webhook_path = f'/bot{BOT_TOKEN}'
        full_webhook_url = f'{WEBHOOK_URL}{webhook_path}'
        
        logger.info(f'Setting up webhook: {full_webhook_url}')
        
        await bot.set_webhook(full_webhook_url)
        logger.info('✅ Webhook set successfully')
    except Exception as error:
        logger.error(f'❌ Failed to set webhook: {error}')

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return {'status': 'Bot is running ✅'}, 200

@app.route(f'/bot{BOT_TOKEN}', methods=['POST'])
async def webhook():
    """Webhook endpoint for Telegram"""
    try:
        update = Update.de_json(request.get_json(force=True), bot)
        await application.process_update(update)
        return {'ok': True}, 200
    except Exception as error:
        logger.error(f'Error handling update: {error}')
        return {'ok': False, 'error': str(error)}, 400

async def init_app():
    """Initialize application"""
    global application
    
    # Create application
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Add handlers
    application.add_handler(CommandHandler('start', start))
    application.add_handler(CommandHandler('apps', apps))
    application.add_handler(CallbackQueryHandler(button_callback))
    
    # Setup webhook
    await setup_webhook()
    
    logger.info(f'🤖 Bot initialized successfully')

if __name__ == '__main__':
    # Initialize bot
    asyncio.run(init_app())
    
    # Run Flask server
    logger.info(f'🚀 Starting Flask server on port {PORT}')
    app.run(host='0.0.0.0', port=PORT, debug=False, use_reloader=False)
