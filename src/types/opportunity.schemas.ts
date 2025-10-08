type ValidationError = { message: string; path?: (string | number)[] };

export function createOpportunityValidator(data: any) {
    const errors: ValidationError[] = [];
    const cleaned: any = {};

    if (!data || typeof data !== 'object') {
        errors.push({ message: 'Body must be an object' });
        return { value: data, errors };
    }

    // title
    if (typeof data.title !== 'string' || data.title.trim().length === 0) {
        errors.push({ message: 'title is required and must be a non-empty string', path: ['title'] });
    } else if (data.title.length > 255) {
        errors.push({ message: 'title must be at most 255 characters', path: ['title'] });
    } else {
        cleaned.title = data.title.trim();
    }

    // description
    if (typeof data.description !== 'string' || data.description.trim().length === 0) {
        errors.push({ message: 'description is required and must be a non-empty string', path: ['description'] });
    } else {
        cleaned.description = data.description.trim();
    }

    // category
    const categories = ['INTERNSHIP','SCHOLARSHIP','COMPETITION','GIG','PITCH','OTHER'] as const;
    if (typeof data.category !== 'string' || !categories.includes(data.category)) {
        errors.push({ message: `category must be one of ${categories.join(', ')}`, path: ['category'] });
    } else {
        cleaned.category = data.category;
    }

    // location
    if (data.location === undefined || data.location === null || data.location === '') {
        cleaned.location = data.location ?? null;
    } else if (typeof data.location === 'string') {
        if (data.location.length > 255) {
            errors.push({ message: 'location must be at most 255 characters', path: ['location'] });
        } else {
            cleaned.location = data.location;
        }
    } else {
        errors.push({ message: 'location must be a string or null', path: ['location'] });
    }

    // isRemote
    if (data.isRemote === undefined) {
        cleaned.isRemote = false;
    } else if (typeof data.isRemote === 'boolean') {
        cleaned.isRemote = data.isRemote;
    } else {
        errors.push({ message: 'isRemote must be a boolean', path: ['isRemote'] });
    }

    // createdBy
    if (typeof data.createdBy !== 'string' || !/^\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\b$/.test(data.createdBy)) {
        errors.push({ message: 'createdBy must be a valid UUID string', path: ['createdBy'] });
    } else {
        cleaned.createdBy = data.createdBy;
    }

    // deadline
    if (data.deadline === undefined || data.deadline === null) {
        cleaned.deadline = data.deadline ?? null;
    } else {
        const d = new Date(data.deadline);
        if (isNaN(d.getTime())) {
            errors.push({ message: 'deadline must be a valid date', path: ['deadline'] });
        } else {
            cleaned.deadline = d;
        }
    }

    return { value: cleaned, errors: errors.length ? errors : undefined };
}

export function updateOpportunityValidator(data: any) {
    const errors: ValidationError[] = [];
    const cleaned: any = {};

    if (!data || typeof data !== 'object') {
        errors.push({ message: 'Body must be an object' });
        return { value: data, errors };
    }

    if (data.title !== undefined) {
        if (typeof data.title !== 'string' || data.title.trim().length === 0) {
            errors.push({ message: 'title must be a non-empty string', path: ['title'] });
        } else if (data.title.length > 255) {
            errors.push({ message: 'title must be at most 255 characters', path: ['title'] });
        } else {
            cleaned.title = data.title.trim();
        }
    }

    if (data.description !== undefined) {
        if (typeof data.description !== 'string' || data.description.trim().length === 0) {
            errors.push({ message: 'description must be a non-empty string', path: ['description'] });
        } else {
            cleaned.description = data.description.trim();
        }
    }

    if (data.category !== undefined) {
        const categories = ['INTERNSHIP','SCHOLARSHIP','COMPETITION','GIG','PITCH','OTHER'] as const;
        if (typeof data.category !== 'string' || !categories.includes(data.category)) {
            errors.push({ message: `category must be one of ${categories.join(', ')}`, path: ['category'] });
        } else {
            cleaned.category = data.category;
        }
    }

    if (data.location !== undefined) {
        if (data.location === null || data.location === '') {
            cleaned.location = null;
        } else if (typeof data.location === 'string') {
            if (data.location.length > 255) {
                errors.push({ message: 'location must be at most 255 characters', path: ['location'] });
            } else {
                cleaned.location = data.location;
            }
        } else {
            errors.push({ message: 'location must be a string or null', path: ['location'] });
        }
    }

    if (data.isRemote !== undefined) {
        if (typeof data.isRemote !== 'boolean') {
            errors.push({ message: 'isRemote must be a boolean', path: ['isRemote'] });
        } else {
            cleaned.isRemote = data.isRemote;
        }
    }

    if (data.deadline !== undefined) {
        if (data.deadline === null) {
            cleaned.deadline = null;
        } else {
            const d = new Date(data.deadline);
            if (isNaN(d.getTime())) {
                errors.push({ message: 'deadline must be a valid date', path: ['deadline'] });
            } else {
                cleaned.deadline = d;
            }
        }
    }

    return { value: cleaned, errors: errors.length ? errors : undefined };
}


