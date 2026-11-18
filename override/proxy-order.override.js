// =====================================================================================
//  Mihomo Party override #2 (JavaScript) — restore the subscription's node order in the pool
//  Bind it to the SAME profile, AFTER the YAML override (order in the override list =
//  order of application; the YAML one replaces proxy-groups, so this must run second).
//
//  Why this file exists: the YAML override's pool group uses `include-all: true`, and mihomo
//  does NOT keep subscription order for that — measured on your core (Meta v1.19.34):
//      include-all member list  ==  sorted(names)   →  DE 2.39 Mbps 183.67 ms first
//      subscription order       ==  cf.vven.us.ci, US 3.77 Mbps…, US 3.67 Mbps…
//  Only an explicit `proxies:` list keeps order, and hard-coding 60 node names would break
//  the config the moment your airport renames a node. So the list is rebuilt at load time
//  from whatever the subscription actually contains — order preserved, never stale.
// =====================================================================================

//  Names matching this are treated as non-node entries and skipped (same keyword list the
//  YAML filter uses, just written as a positive match).
const NON_NODE = /(DIRECT|REJECT|直接连接|官网|官方|客服|网站|网址|获取|订阅|流量|到期|已用|过期|备用|群|邀请|返利|机场|下次|版本|官址|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|无法|说明|使用|提示|特别|访问|支持|教程|关注|更新|作者|加入|USE|USED|TOTAL|EXPIRE|EMAIL|Panel|Channel|Author)/i;

function main(config) {
  const groups = config['proxy-groups'] || [];
  // Find the pool without depending on its name (names carry emoji and are yours to rename):
  // the include-all group IS the pool. Fallback: any group whose name ends in "Proxy".
  const proxyGroup =
    groups.find((g) => g && g['include-all'] === true) ||
    groups.find((g) => g && typeof g.name === 'string' && g.name.endsWith('Proxy'));
  if (!proxyGroup) return config; // YAML override not bound — nothing to fix

  const ordered = (config.proxies || [])
    .map((p) => p && p.name)
    .filter((n) => n && !NON_NODE.test(n));

  if (ordered.length) {
    proxyGroup.proxies = ordered;      // exactly the order the subscription lists them
    delete proxyGroup['include-all'];  // this is what silently sorted the list
    delete proxyGroup.filter;          // only meaningful together with include-all/use
  }
  return config;
}
