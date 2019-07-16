FROM nginx:1.17

WORKDIR ./
# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx.vh.default.conf /etc/nginx/conf.d/default.tmpl
COPY  ./dist/hyperiot /usr/share/nginx/html

CMD /bin/sh -c "export DOLLAR=$ && envsubst < /etc/nginx/conf.d/default.tmpl > /etc/nginx/conf.d/default.conf && cat /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;' "
