# 进入生成的文件夹
cd docs/.vuepress/dist

# 如果是发布到自定义域名
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'


# 如果发布到 https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:ajiangpz/fancy-select.git master:gh-pages

cd -