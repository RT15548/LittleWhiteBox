const { firefox } = require("playwright");
const fs = require("fs");
const path = require("path");

const AUTH_DIR = "auth";

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`📂 目录 "${path.basename(dirPath)}" 不存在，正在创建...`);
    fs.mkdirSync(dirPath);
  }
}

function getNextAuthIndex() {
  const directory = path.join(__dirname, AUTH_DIR);

  if (!fs.existsSync(directory)) {
    return 1;
  }

  const files = fs.readdirSync(directory);
  const authRegex = /^auth-(\d+)\.json$/;

  let maxIndex = 0;
  files.forEach((file) => {
    const match = file.match(authRegex);
    if (match) {
      const currentIndex = parseInt(match[1], 10);
      if (currentIndex > maxIndex) {
        maxIndex = currentIndex;
      }
    }
  });
  return maxIndex + 1;
}

function getCamoufoxPath() {
  const platform = process.platform;
  if (platform === "linux") {
    return path.join(__dirname, "camoufox", "camoufox");
  } else if (platform === "win32") {
    return path.join(__dirname, "camoufox", "camoufox.exe");
  } else if (platform === "darwin") {
    return path.join(__dirname, "camoufox", "camoufox");
  }
  throw new Error(`不支持的操作系统: ${platform}`);
}

(async () => {
  const authDirPath = path.join(__dirname, AUTH_DIR);
  ensureDirectoryExists(authDirPath);

  const newIndex = getNextAuthIndex();
  const newAuthFileName = `auth-${newIndex}.json`;

  console.log(`\n▶️  准备为账户 #${newIndex} 创建新的认证文件...`);
  
  const browserPath = getCamoufoxPath();
  console.log(`▶️  启动浏览器: ${browserPath}`);

  const browser = await firefox.launch({
    headless: false,
    executablePath: browserPath,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("\n=== 请在新打开的 Camoufox 窗口中完成以下操作 ===");
  console.log("1. 浏览器将打开 You.com，请在页面中【完全登录】您的账户。");
  console.log("2. 登录成功后，请不要关闭浏览器窗口。");
  console.log('3. 回到这个终端，然后按 "Enter" 键继续...\n');

  await page.goto("https://you.com");

  await new Promise((resolve) => process.stdin.once("data", resolve));

  // 获取账户名（尝试多种方法）
  let accountName = "unknown";
  try {
    console.log("🕵️  正在尝试获取账户信息...");
    
    // 从 cookies 中获取账户信息
    const cookies = await context.cookies();
    const uuidCookie = cookies.find(c => c.name === "uuid_guest");
    if (uuidCookie) {
      accountName = `you_${uuidCookie.value.substring(0, 8)}`;
      console.log(`   -> 从 Cookie 获取账户标识: ${accountName}`);
    }
  } catch (error) {
    console.warn(`⚠️  无法自动获取账户名。`);
    console.warn(`   -> 错误: ${error.message}`);
    console.warn(`   -> 将使用 "unknown" 作为账户名。`);
  }

  console.log("\n正在获取并保存登录状态...");
  const currentState = await context.storageState();
  currentState.accountName = accountName;
  
  const prettyStateString = JSON.stringify(currentState, null, 2);
  const authFilePath = path.join(authDirPath, newAuthFileName);

  fs.writeFileSync(authFilePath, prettyStateString);
  console.log(`✅ 认证文件已保存到: ${path.join(AUTH_DIR, newAuthFileName)}`);
  console.log(`   账户名: ${accountName}`);
  console.log(`   Cookies 数量: ${currentState.cookies?.length || 0}`);

  await browser.close();
  console.log("\n浏览器已关闭。");

  process.exit(0);
})();
