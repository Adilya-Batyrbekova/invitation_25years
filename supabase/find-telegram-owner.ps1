$ErrorActionPreference = 'Stop'

function Invoke-BotRead([string]$Method) {
    try {
        $result = Invoke-RestMethod -Uri ($botUrl + '/' + $Method) -TimeoutSec 20
        if (-not $result.ok) { throw 'Telegram rejected the request.' }
        return $result.result
    } catch {
        throw 'Telegram request failed. Check the bot token and network connection.'
    }
}

$secureToken = Read-Host 'Enter the new BotFather token (hidden input)' -AsSecureString
$tokenPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)
try {
    $token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($tokenPointer)
    if ($token -notmatch '^\d+:[A-Za-z0-9_-]+$') {
        throw 'Invalid token format.'
    }
    $botUrl = 'https://api.telegram.org/bot' + $token
    $bot = Invoke-BotRead 'getMe'
    $webhook = Invoke-BotRead 'getWebhookInfo'
    if ($webhook.url) {
        throw 'This bot already has a webhook. Leave it in place and check the existing setup.'
    }

    $challenge = '/start setup_' + [guid]::NewGuid().ToString('N')
    Write-Host ('Send this command in your private chat with @' + $bot.username + ':')
    Write-Host $challenge
    $null = Read-Host 'Press Enter after sending it'
    $ids = @(Invoke-BotRead 'getUpdates' | ForEach-Object {
        $message = $_.message
        if ($message.chat.type -eq 'private' -and $message.text -ceq $challenge -and
            $message.from.id -and $message.from.id -eq $message.chat.id) {
            [string]$message.from.id
        }
    } | Sort-Object -Unique)
    if ($ids.Count -ne 1) {
        throw 'No unique owner match. Run again and send the new command in the private chat.'
    }
    Write-Output ('TELEGRAM_OWNER_ID=' + $ids[0])
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($tokenPointer)
    Remove-Variable token, botUrl -ErrorAction SilentlyContinue
    $secureToken.Dispose()
}
