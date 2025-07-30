<?php
/**
 * 从 FreshRSS 获取所有订阅文章并保存为 JSON 文件
 * 功能：登录认证、分页获取、错误处理、数据格式化
 */
class FreshRSSClient {
    private $apiUrl;
    private $authToken;

    public function __construct($apiUrl) {
        $this->apiUrl = rtrim($apiUrl, '/');
    }

    /**
     * 主入口：执行完整流程
     */
    public function fetchAllArticlesAndSave($user, $password, $outputFile = 'output.json') {
        try {
            $this->login($user, $password);
            $subscriptions = $this->getSubscriptions();
            $articles = $this->getAllArticles($subscriptions);
            $this->saveToJson($articles, $outputFile);
            echo "成功保存 " . count($articles) . " 篇文章到 $outputFile\n";
        } catch (Exception $e) {
            echo "运行失败: " . $e->getMessage() . "\n";
            exit(1);
        }
    }

    /**
     * 登录并获取 Auth Token
     */
    private function login($user, $password) {
        $url = $this->apiUrl . '/accounts/ClientLogin?Email=' . urlencode($user) . '&Passwd=' . urlencode($password);
        echo "登录请求: $url\n";
        
        $response = $this->curlRequest($url);
        if (strpos($response, 'Auth=') === false) {
            throw new Exception("登录失败，响应: $response");
        }

        $this->authToken = substr($response, strpos($response, 'Auth=') + 5);
        echo "登录成功，Auth Token: " . substr($this->authToken, 0, 20) . "...\n";
    }

    /**
     * 获取所有订阅源
     */
    private function getSubscriptions() {
        $url = $this->apiUrl . '/reader/api/0/subscription/list?output=json';
        echo "获取订阅源: $url\n";
        
        $response = $this->curlRequest($url, $this->authToken);
        $data = $this->parseJson($response);
        
        if (empty($data['subscriptions'])) {
            throw new Exception("无有效订阅源，响应: " . json_encode($data));
        }
        
        echo "发现 " . count($data['subscriptions']) . " 个订阅源\n";
        return $data['subscriptions'];
    }

    /**
     * 获取所有订阅源的文章（分页）
     */
    private function getAllArticles($subscriptions) {
        $allArticles = [];
        foreach ($subscriptions as $sub) {
            try {
                echo "处理订阅源: {$sub['title']} (ID: {$sub['id']})\n";
                $articles = $this->getArticlesForSubscription($sub['id']);
                foreach ($articles as $article) {
                    $allArticles[] = $this->formatArticle($sub, $article);
                }
                echo "已获取 " . count($articles) . " 篇文章\n";
            } catch (Exception $e) {
                echo "订阅源 {$sub['title']} 处理失败: " . $e->getMessage() . "\n";
            }
        }
        
        // 按发布时间排序
        usort($allArticles, fn($a, $b) => strtotime($b['time']) - strtotime($a['time']));
        return $allArticles;
    }

    /**
     * 分页获取单个订阅源的文章
     */
    private function getArticlesForSubscription($subscriptionId) {
        $articles = [];
        $continuationToken = null;
        $page = 1;

        do {
            $url = $this->apiUrl . '/reader/api/0/stream/contents/' . urlencode($subscriptionId);
            $url .= '?n=1000' . ($continuationToken ? "&c=$continuationToken" : '');
            echo "分页 $page: $url\n";
            
            $response = $this->curlRequest($url, $this->authToken);
            $data = $this->parseJson($response);
            
            if (empty($data['items'])) break;
            
            $articles = array_merge($articles, $data['items']);
            $continuationToken = $data['continuation'] ?? null;
            $page++;
        } while ($continuationToken);

        return $articles;
    }

    /**
     * 格式化单篇文章数据
     */
    private function formatArticle($subscription, $article) {
        return [
            'site_name' => $subscription['title'],
            'title'     => $article['title'] ?? '无标题',
            'link'      => $article['alternate'][0]['href'] ?? '#',
            'time'      => date('Y-m-d H:i', $article['published'] ?? time()),
            'description' => $this->truncateDescription($article['summary']['content'] ?? ''),
            'icon'      => $subscription['iconUrl'] ?? null
        ];
    }

    /**
     * 截断长摘要
     */
    private function truncateDescription($content, $maxLength = 100) {
        $text = strip_tags(html_entity_decode($content, ENT_QUOTES, 'UTF-8'));
        $text = trim($text);
        
        if (mb_strlen($text, 'UTF-8') <= $maxLength) return $text;
        return mb_substr($text, 0, $maxLength, 'UTF-8') . '...';
    }

    /**
     * 安全的 CURL 请求
     */
    private function curlRequest($url, $authToken = null) {
        $ch = curl_init($url);
        $options = [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTP_VERSION  => CURL_HTTP_VERSION_1_1, // 强制 HTTP/1.1
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_CAINFO        => '/etc/ssl/certs/ca-certificates.crt',
            CURLOPT_TIMEOUT        => 30,
            CURLOPT_HTTPHEADER     => [
                'User-Agent: FreshRSS-Client/1.0',
                'Accept: application/json',
                $authToken ? 'Authorization: GoogleLogin auth=' . $authToken : ''
            ]
        ];
        curl_setopt_array($ch, $options);
        
        $response = curl_exec($ch);
        if ($response === false) {
            $error = curl_error($ch);
            curl_close($ch);
            throw new Exception("CURL 请求失败: $error");
        }
        
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            throw new Exception("HTTP 错误: $httpCode");
        }
        
        return $response;
    }

    /**
     * JSON 解析与校验
     */
    private function parseJson($response) {
        $data = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("JSON 解析失败: " . json_last_error_msg());
        }
        return $data;
    }

    /**
     * 保存 JSON 文件
     */
    private function saveToJson($data, $filename) {
        $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if (file_put_contents($filename, $json) === false) {
            throw new Exception("无法写入文件: $filename");
        }
    }
}

// ====== 使用示例 ======
$client = new FreshRSSClient('https://f.xieha.cn/api/greader.php');
$client->fetchAllArticlesAndSave('welog', 'welog123', 'output.json');