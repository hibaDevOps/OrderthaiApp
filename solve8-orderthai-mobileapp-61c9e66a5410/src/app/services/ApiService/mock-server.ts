import { HttpErrorResponse, HttpEvent, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { mockPath } from './jsonindex';

export class MockServer {
    private static MOCK_DATA_PATH: 'assets/mockdata/';
    private static publicUrl: string[] = ['login', 'logout'];
    public static serve(request: HttpRequest<any>): Observable<HttpEvent<any>> {
        const file = this.getPath(request);
        if (MockServer.validate(request)) {
            if (MockServer.checkRequestParameter(request)) {
                if (!MockServer.validateRequest(request)) {
                    return of(new HttpResponse({ status: 400, body: { error: 'Invalidate request or record not found' } }));
                }
                return of(new HttpResponse({ status: 200, body: mockPath.get(file) }));
            } else {
                return of(new HttpResponse({ status: 400, body: { error: 'Parameter missing' } }));
            }
        } else {
            return of(new HttpResponse({ status: 401, body: { error: 'Authentication falier' } }));
        }
    }
    static validateRequest(request: any) {
        const file = this.getPath(request);
        request = request.body;
        let flag = true;
        if (!this.publicUrl.includes(file)) {
            if (request.ownerId !== '278099' || !request.userId || !request.accessToken) {
                flag = false;
            } else {
                switch (file) {
                    case 'get_profile':
                        break;
                    default:
                        flag = false;
                }
            }
        } else {
            switch (file) {
                case 'login':
                    if (!request.email.includes('abc@gmail.com') || !request.password.includes('123456')) {
                        flag = false;
                    }
                    break;
                case 'logout': break;
                default:
                    flag = false;
            }
        }
        return flag;
    }
    static validate(request: HttpRequest<any>) {
        const file = this.getPath(request);
        if (!this.publicUrl.includes(file)) {
            return request.headers.get('accessToken').includes('xLwI2Z35MpcYdhnJWRK6e8i4UBX7G1PH');
        } else {
            return true;
        }
    }

    /**
     * 
     * @param request this is httprequest which is use to test the all require merameters are there or not as per the endpoint,
     */
    private static checkRequestParameter(request): boolean {
        const file = this.getPath(request);
        request = request.body;
        let flag = true;
        if (!this.publicUrl.includes(file)) {
            if (request.ownerId !== '278099' || !request.userId || !request.accessToken) {
                flag = false;
            } else {
                switch (file) {
                    case 'get_profile':
                        break;
                }
            }
        } else {
            switch (file) {
                case 'login':
                    if (!request.email || !request.password) {
                        flag = false;
                    }
                    break;
                case 'logout':
                    break;
                case 'forgot_password':
                    break;
            }
        }
        return flag;
    }
    private static getPath(request): string {
        let file: any = request.url.split('/');
        file = file[file.length - 1];
        return file;
    }
} 